exports.up = function(knex, Promise) {
    return knex.schema.table('users', function (table) {
        table.string('registration_source')
    })
}

exports.down = function(knex, Promise) {
    return knex.schema.table('users', function (table) {
        table.dropColumn('registration_source')
    })
}