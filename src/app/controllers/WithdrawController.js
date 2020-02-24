import * as Yup from 'yup';
import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';

class WithdrawController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const { id: deliveryman_id } = req.params;

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Invalid deliveryman id' });
    }

    const deliveries = await Delivery.findAll({
      order: ['created_at'],
      attributes: ['id', 'product'],
      limit: 10,
      offset: (page - 1) * 10,
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'recipient_name',
            'street',
            'number',
            'complement',
            'state',
            'city',
            'zip_code',
          ],
        },
      ],
      where: {
        deliveryman_id,
        canceled_at: null,
        end_date: null,
        start_date: null,
      },
    });

    return res.json(deliveries);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { deliveryman_id, delivery_id } = req.params;

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exists' });
    }

    const delivery = await Delivery.findOne({
      where: { id: delivery_id, deliveryman_id },
    });

    if (!delivery) {
      return res.status(400).json({ error: 'Invalid delivery id' });
    }

    if (delivery.canceled_at) {
      return res.status(400).json({ error: 'Delivery canceled' });
    }

    if (delivery.end_date) {
      return res
        .status(400)
        .json({ error: 'Can not withdraw a ended delivery' });
    }

    if (delivery.start_date) {
      return res
        .status(400)
        .json({ error: 'Delivery has already been withdrawn' });
    }

    const { start_date } = req.body;

    await delivery.update({ start_date });

    return res.json(delivery);
  }
}
export default new WithdrawController();
