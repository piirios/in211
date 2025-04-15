import typeorm from 'typeorm';

const List = new typeorm.EntitySchema({
    name: 'List',
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: 'increment'
        },
        name: {
            type: 'varchar'
        },
        userId: {
            type: 'uuid',
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
        movies: {
            type: 'many-to-many',
            target: 'Movie',
            joinTable: {
                name: 'list_movies',
                joinColumn: {
                    name: 'listId',
                    referencedColumnName: 'id'
                },
                inverseJoinColumn: {
                    name: 'movieId',
                    referencedColumnName: 'id'
                }
            }
        }
    }
});

export default List;