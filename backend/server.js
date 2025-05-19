import express from 'express';
import path from 'path';
import logger from 'morgan';
import cors from 'cors';
import usersRouter from './routes/users.js';
import moviesRouter from './routes/movies.js';
import listsRouter from './routes/lists.js';
import commentRouter from './routes/comment.js';
import { routeNotFoundJsonHandler } from './services/routeNotFoundJsonHandler.js';
import { jsonErrorHandler } from './services/jsonErrorHandler.js';
import { appDataSource } from './datasource.js';

const apiRouter = express.Router();

appDataSource
  .initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
    const app = express();

    app.use(logger('dev'));

    // Configuration CORS plus détaillée
    const corsOptions = {
      origin: ['https://ensta-in211.vercel.app', 'http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    };
    app.use(cors(corsOptions));

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // Register routes
    apiRouter.get('/', (req, res) => {
      res.send('Hello from Express!');
    });
    apiRouter.use('/users', usersRouter);
    apiRouter.use('/movies', moviesRouter);
    apiRouter.use('/lists', listsRouter);
    apiRouter.use('/comment', commentRouter);

    // Register API router
    app.use('/api', apiRouter);

    // Register frontend
    const publicPath = new URL("./public", import.meta.url).pathname;
    app.use(express.static(publicPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(publicPath, "index.html"));
    });

    // Register 404 middleware and error handler
    app.use(routeNotFoundJsonHandler); // this middleware must be registered after all routes to handle 404 correctly
    app.use(jsonErrorHandler); // this error handler must be registered after all middleware to catch all errors

    const port = parseInt(process.env.PORT || '3001');

    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });

/* console.log('Data Source has been initialized!');
const app = express();

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register routes
apiRouter.get('/', (req, res) => {
  res.send('Hello from Express!');
});

app.use('/api', apiRouter);
apiRouter.use('/movies', moviesRouter);

const port = parseInt(process.env.PORT || '3001');
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
}); */