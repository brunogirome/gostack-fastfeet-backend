import * as Yup from 'yup';
import DeliveryProblem from '../models/DeliveryProblem';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';
import Queue from '../../lib/Queue';
import CanceledMail from '../jobs/CanceledMail';

class DeliveryProblemController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const deliveries = await DeliveryProblem.findAll({
      attributes: [],
      limit: 10,
      order: ['created_at'],
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

    return res.json(deliveries);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { delivery_id } = req.params;

    const delivery = await Delivery.findByPk(delivery_id);

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery does not exists' });
    }

    const { description } = req.body;

    const { id } = await DeliveryProblem.create({
      delivery_id,
      description,
    });

    return res.json({ id, delivery_id, description });
  }

  async show(req, res) {
    const { delivery_id } = req.params;

    const delivery = await Delivery.findByPk(delivery_id);

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery not found' });
    }

    const deliveryProblems = await DeliveryProblem.findAll({
      attributes: ['id', 'description'],
      where: { delivery_id },
    });

    return res.json(deliveryProblems);
  }

  async delete(req, res) {
    const { problem_id } = req.params;

    const deliveryProblem = await DeliveryProblem.findByPk(problem_id);

    if (!deliveryProblem) {
      return res.status(400).json('Delivery problem not found');
    }

    const { delivery_id } = deliveryProblem;

    const delivery = await Delivery.findByPk(delivery_id);

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery does not exists' });
    }

    if (delivery.canceled_at) {
      return res.status(400).json({ error: 'Delivery already canceled' });
    }

    await delivery.update({ canceled_at: new Date() });

    const deliveryman = await Deliveryman.findByPk(delivery.deliveryman_id);

    await Queue.add(CanceledMail.key, {
      deliveryProblem,
      delivery,
      deliveryman,
    });

    return res.json(delivery);
  }
}

export default new DeliveryProblemController();
