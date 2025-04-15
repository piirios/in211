import typeorm from 'typeorm';

const Movie = new typeorm.EntitySchema({
    name: 'Movie',
    columns: {
        id: {
            primary: true,
            type: 'int'
        }
    },
    relations: {
        lists: {
            type: 'many-to-many',
            target: 'List',
            joinTable: true,
        },
        comments: {
            type: 'one-to-many',
            target: 'Comment',
            inverseSide: 'movie',
        },
    },
});

export default Movie;