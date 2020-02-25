import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import FileController from './app/controllers/FileController';
import DeliverymanController from './app/controllers/DeliverymanController';
import DeliveryController from './app/controllers/DeliveryController';
import WithdrawController from './app/controllers/WithdrawController';
import DeliveredController from './app/controllers/DeliveredController';
import DeliveryProblemController from './app/controllers/DeliveryProblemController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/sessions', SessionController.store);

routes.get('/recipients/:id', RecipientController.show);

routes.get('/deliverymans/:id/withdraws', WithdrawController.index);
routes.put(
  '/deliverymans/:deliveryman_id/withdraws/:delivery_id',
  WithdrawController.update
);
routes.put(
  '/deliverymans/:deliveryman_id/deliver/:delivery_id',
  DeliveredController.update
);
routes.get('/deliverymans/:id/delivereds', DeliveredController.index);

routes.get('/files/:id', FileController.show);

/**
 * Routes that need authetication
 */
routes.use(authMiddleware);

routes.post('/recipients', RecipientController.store);
routes.get('/auth', (req, res) => res.json({ message: 'Authenticated' }));

routes.post('/files', upload.single('file'), FileController.store);

routes.post('/deliverymans', DeliverymanController.store);
routes.get('/deliverymans', DeliverymanController.index);
routes.put('/deliverymans/:id', DeliverymanController.update);
routes.delete('/deliverymans/:id', DeliverymanController.delete);

routes.post('/deliveries', DeliveryController.store);
routes.get('/deliveries', DeliveryController.index);
routes.put('/deliveries/:id', DeliveryController.update);
routes.delete('/deliveries/:id', DeliveryController.delete);

routes.get('/deliveries/problems', DeliveryProblemController.index);

export default routes;
