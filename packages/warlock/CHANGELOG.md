Changelog
---

# v0.2.0

* Merge [#18](https://github.com/TheDeveloper/warlock/pull/18): Pass lock id to `.lock` callback.

# v0.1.3

* Allow proper use of Warlock with different redis clients.

# v0.1.2

* Update [`uuid`](https://www.npmjs.org/package/uuid) dependency to v2.0.1.
* Merge [#5](https://github.com/TheDeveloper/warlock/pull/5): Fix Lua script arg usage.

# v0.1.1

* Bugfix

# v0.1.0

* Key generator no longer md5's the key. Instead appends a ':lock' string to the original key. To override, set `warlock.makeKey` to your own function.
* Lock ownership check uses `uuid.v1` value.
* Bump Redis requirement to `v2.6.12`.
* Using additional Redis SET arguments to set lock key instead of script.
* Add `warlock.optimistic` method.
