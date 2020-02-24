import { format, parseISO, isSameDay } from 'date-fns';
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
    const start_date = new Date();

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

    /**
     * Checking if it has more than 5 deliveries today
     */

    const deliveires = await Delivery.findAll({
      where: { deliveryman_id, canceled_at: null },
    });

    let deliveryCount = 0;

    deliveires.forEach(deliveryItem => {
      if (deliveryItem.start_date) {
        const date = format(
          deliveryItem.start_date,
          "yyyy-MM-dd'T'HH:mm:ssxxx"
        );

        if (isSameDay(parseISO(date), start_date)) {
          deliveryCount += 1;
        }
      }
    });

    if (deliveryCount >= 5) {
      return res
        .status(400)
        .json({ error: 'You already made 5 deliveries today' });
    }

    await delivery.update({ start_date });

    return res.json(delivery);
  }
}
export default new WithdrawController();
