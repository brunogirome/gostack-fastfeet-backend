import { Op } from 'sequelize';
import Deliveryman from '../models/Deliveryman';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';

class DeliveredController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const { id: deliveryman_id } = req.params;

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exists' });
    }

    const deliveries = await Delivery.findAll({
      order: ['created_at'],
      attributes: ['id', 'product', 'start_date', 'end_date'],
      limit: 10,
      offset: (page - 1) * 10,
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['recipient_name', 'state', 'city', 'zip_code'],
        },
      ],
      where: { deliveryman_id, end_date: { [Op.not]: null } },
    });

    return res.json(deliveries);
  }

  async update(req, res) {
    /**
     * End a delivery
     */

    if (end_date && !delivery.start_date) {
      return res
        .status(400)
        .json({ error: 'Can not send a end date without a start date' });
    }

    if (end_date) {
      const signature = await File.findByPk(signature_id);

      if (!signature) {
        return res
          .status(400)
          .json({ error: 'Signature file does not exists' });
      }

      const delivery_start = format(
        delivery.start_date,
        "yyyy-MM-dd'T'HH:mm:ssxxx"
      );

      if (isBefore(parseISO(end_date), parseISO(delivery_start))) {
        return res.status(400).json({ error: 'Invalid end date' });
      }
    }
  }
}

export default new DeliveredController();
