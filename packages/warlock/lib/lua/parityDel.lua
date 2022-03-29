--
-- Delete a key if content is equal
--
-- KEYS[1]   - key
-- KEYS[2]   - content
local key     = KEYS[1]
local content = ARGV[1]

local value = redis.call('get', key)

if value == content then
  return redis.call('del', key);
end

return 0
