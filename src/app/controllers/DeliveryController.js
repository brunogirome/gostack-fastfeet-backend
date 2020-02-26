import * as Yup from 'yup';
import { isBefore, parseISO, format } from 'date-fns';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';
import Queue from '../../lib/Queue';
import AvaliableMail from '../jobs/AvaliableMail';

class DeliveryController {
  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.validate(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { recipient_id, deliveryman_id } = req.body;

    const recipient = await Recipient.findByPk(recipient_id);

    if (!recipient) {
      return res.status(400).json({ error: 'Recipient does not exists' });
    }

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exists' });
    }

    const delivery = await Delivery.create(req.body);

    await Queue.add(AvaliableMail.key, { delivery, recipient, deliveryman });

    return res.json(delivery);
  }

  async index(req, res) {
    const { page = 1 } = req.query;

    const deliveries = await Delivery.findAll({
      order: ['created_at'],
      attributes: [
        'id',
        'product',
        'canceled_at',
        'start_date',
        'end_date',
        'withdrawable',
      ],
      limit: 10,
      offset: (page - 1) * 10,
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
            { model: File, as: 'avatar', attributes: ['name', 'path', 'url'] },
          ],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return res.json(deliveries);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      deliveryman_id: Yup.number(),
      end_date: Yup.date(),
    });

    if (!(await schema.validate(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const delivery = await Delivery.findByPk(req.params.id);

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery id not found' });
    }

    const { deliveryman_id, end_date } = req.body;

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exists' });
    }

    let { start_date } = delivery;

    if (end_date && !start_date) {
      return res
        .status(400)
        .json({ error: 'Can not send a end date without a start date' });
    }

    start_date = format(start_date, "yyyy-MM-dd'T'HH:mm:ssxxx");

    if (
      end_date &&
      start_date &&
      isBefore(parseISO(end_date), parseISO(start_date))
    ) {
      return res.status(400).json({ error: 'Invalid end date' });
    }

    const { id, withdrawble } = await delivery.update(req.body);

    return res.json({ id, withdrawble, deliveryman, start_date, end_date });
  }

  async delete(req, res) {
    const delivery = await Delivery.findByPk(req.params.id);

    if (delivery.canceled_at !== null) {
      return res.status(400).json({ error: 'Delivery already canceled' });
    }

    const { canceled_at } = req.query;

    await delivery.update({ canceled_at });

    return res.status(204).json();
  }
}

export default new DeliveryController();
