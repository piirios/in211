import typeorm from 'typeorm';

const Comment = new typeorm.EntitySchema({
    name: 'Comment',
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: 'increment'
        },
        content: {
            type: 'varchar'
        },
        score: {
            type: 'int'
        },
        userId: {
            type: 'uuid',
            nullable: true
        },
        movieId: {
            type: 'int',
            nullable: true
        }
    },
    relations: {
        user: {
            type: 'many-to-one',
            target: 'User',
            joinColumn: {
                name: 'userId',
                referencedColumnName: 'id'
            }
        },
        movie: {
            type: 'many-to-one',
            target: 'Movie',
            joinColumn: {
                name: 'movieId',
                referencedColumnName: 'id'
            }
        },
    },
    indices: [
        {
            columns: ['user', 'movie'],
            name: 'IDX_USER_MOVIE',
            unique: true,
        },
    ],
});

export default Comment;