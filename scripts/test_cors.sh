#!/usr/bin/env bash

# CORS (Cross-Origin Request Sharing) can be frustrating to configure, so this
# script aims to simplify testing of CORS configurations for the CDN and assets
# bucket. This should help ensure the configuration is working for all users.

# Architecture notes (staging):
# - The user visits https://staging.duelyst.org, which serves an index.html
#   page directly from Express.
# - Origin https://staging.duelyst.org requests assets from CloudFront, with
#   the URL https://cdn.duelyst.org, such as the duelyst.js game client.
# - CloudFront requests the asset from S3 and caches it.
# - Both CloudFront and S3 should include CORS response headers to enable using
#   assets from the CDN in the client app/domain/origin.

# HTTP Targets.
# Requests for APP_ORIGIN/file will redirect to CDN_ORIGIN/staging/file.
APP_ORIGIN="https://staging.duelyst.org"
CDN_ORIGIN="https://cdn.duelyst.org"
CDN_URL="https://d3tg1rqy5u5jtl.cloudfront.net"
S3_URL="https://s3.amazonaws.com/duelyst.org-assets"

# Example assets which have been missing CORS headers in staging.
ORB_IMAGE="resources/booster_pack_opening/booster_orb.png"
VET_IMAGE="resources/crests/crest_f3.png"

# CORS Preflight Requests.
# A CORS Preflight request ensures that CORS is supported by a server endpoint.
# It uses the HEAD method and includes Access-Control-Request-Method and
# Access-Control-Request-Headers request headers. The response should contain
# Access-Control-Allow-Origin, Access-Control-Max-Age, and
# Access-Control-Allow-Methods headers.
send_cors_preflight_request () {
	URL=$1
	ORIGIN=$2
	echo -e "Sending CORS Preflight HEAD Request to ${URL} with origin ${ORIGIN}"
	curl -s -I -L -X HEAD \
		-H "Origin: ${ORIGIN}" \
		-H 'Access-Control-Request-Method GET' \
		-H 'Access-Control-Request-Headers X-Requested-With' \
		$URL | grep -i '^Access-Control-Allow-Origin' || {
			echo -e "CORS chekc failed! Missing Access-Control-Allow-Origin header!\n"
			return
		}
	echo -e "CORS check passed!\n"
}

# CORS Requests.
# A CORS request is a typical GET request which includes the Origin header.
send_cors_request () {
	URL=$1
	ORIGIN=$2
	echo -e "Sending CORS GET Request to ${URL} with origin ${ORIGIN}"
	curl -s -I -L -H "Origin: ${ORIGIN}" $URL | grep -i '^Access-Control-Allow-Origin' || {
		echo -e "CORS check failed! Missing Access-Control-Allow-Origin header!\n"
		return
	}
	echo -e "CORS check passed!\n"
}

# S3 Tests.
URL="${S3_URL}/staging/${ORB_IMAGE}"
send_cors_preflight_request $URL $APP_ORIGIN
send_cors_preflight_request $URL $CDN_ORIGIN
send_cors_request $URL $APP_ORIGIN
send_cors_request $URL $CDN_ORIGIN

# CloudFront Tests.
URL="${CDN_URL}/staging/${ORB_IMAGE}"
send_cors_preflight_request $URL $APP_ORIGIN
send_cors_request $URL $APP_ORIGIN

# API Tests.
URL="${APP_ORIGIN}/${ORB_IMAGE}"
send_cors_preflight_request $URL $APP_ORIGIN
send_cors_request $URL $APP_ORIGIN
