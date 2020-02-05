import { Router } from 'express';

import SessionController from './app/controllers/SessionController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.get('/', (req, res) => res.json({ message: 'Hello World. :)' }));

routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.get('/auth', (req, res) => res.json({ message: 'Authenticated' }));

export default routes;
