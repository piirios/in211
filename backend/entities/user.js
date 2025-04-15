import typeorm from 'typeorm';
import { OneToMany } from 'typeorm';

const User = new typeorm.EntitySchema({
  name: 'User',
  columns: {
    id: {
      primary: true,
      generated: 'uuid',
      type: 'uuid',
    },
    email: {
      type: String,
      unique: true,
    },
    firstname: { type: String },
    lastname: { type: String },
  },
  relations: {
    list: {
      type: 'one-to-many',
      target: 'List',
      inverseSide: 'user',
      cascade: true,
    },
    comments: {
      type: 'one-to-many',
      target: 'Comment',
      inverseSide: 'user',
      cascade: true,
    },
  }
});

export default User;
