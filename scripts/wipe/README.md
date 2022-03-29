DATABASE WIPE
============================
## USE WITH CAUTION!

### all entries in auth database should have a username associated with them
- [optional] first step
- `add_username_to_auth.coffee` script copies username from profile data
- if a username already exists in auth database, it will get overwritten with username from profile data

### run `reinitialize_user.coffee` to recreate profile data from data in the auth database
- buddy lists are preserved
- entire database gets wiped prior to reinitializing users

### run `create_users_indices.coffee`
- recreates username index
- recreates email index