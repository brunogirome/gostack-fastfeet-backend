import DeliveryProblem from '../models/DeliveryProblem';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class DeliveryProblemController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const deliverys = await DeliveryProblem.findAll({
      limit: 10,
      offset: (page - 1) * 10,
      include: [
        {
          model: Delivery,
          as: 'delivery',
          attributes: [
            'id',
            'product',
            'canceled_at',
            'start_date',
            'end_date',
          ],
          include: [
            {
              model: Recipient,
              as: 'recipient',
              attributes: ['recipient_name', 'state', 'city', 'zip_code'],
            },
            {
              model: Deliveryman,
              as: 'deliveryman',
              attributes: ['name', 'email'],
              include: [
                {
                  model: File,
                  as: 'avatar',
                  attributes: ['name', 'path', 'url'],
                },
              ],
            },
            {
              model: File,
              as: 'signature',
              attributes: ['name', 'path', 'url'],
            },
          ],
        },
      ],
    });

    return res.json(deliverys);
  }

  async store(req, res) {}
}

export default new DeliveryProblemController();
