### terraform - development server
boot up a development server in under 2 minutes.
script included to generate new ssh key which will be used to provision and connect to DO instance.

### pre-requisites
- ssh-keygen available
- terraform installed
- DO API access key (either provided in prompt or as DIGITALOCEAN_TOKEN environment variable)

### step 1 - generate a fresh ssh key
Run the `create-ssh-key.sh` script:
```
./create-ssh-key
```
Will result in a newly generated key in the `/ssh` folder.

### step 2 - boot up new instance
Modify the `variables.tf` file as necessary (ie changing the instance size or tag name) then create the instance:
```
./create-instance
```
Will result in the outputted DO instance IP, ready for development.

### step 3 [optional] - ssh into machine for maintenance
Run the `connect-ssh.sh` script:
```
./connect-ssh
```

### deploy code to instance
The `.deployignore` file contains a list of paths and files relative the root project directory to ignore syncing. Files in `.gitignore` are also excluded.
```
./deploy.sh
```

### tail logs from instance
```
./logs.sh
```

### destroy instance
```
./destroy.sh
```
