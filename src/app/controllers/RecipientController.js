import * as Yup from 'yup';
import Recipient from '../models/Recipient';

class RecipientController {
  async show(req, res) {
    const recipient = await Recipient.findByPk(req.params.id);

    if (!recipient) {
      return res.status(401).json({ erro: 'Delivery does not exists' });
    }

    const {
      id,
      recipientName,
      street,
      number,
      complement,
      state,
      city,
      zipCode,
    } = recipient;

    return res.json({
      id,
      recipientName,
      street,
      number,
      complement,
      state,
      city,
      zipCode,
    });
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      recipientName: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.number().required(),
      complement: Yup.string(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      zipCode: Yup.string()
        .length(8)
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const {
      recipientName,
      street,
      number,
      complement,
      state,
      city,
      zipCode,
    } = await Recipient.create(req.body);

    return res.json({
      recipientName,
      street,
      number,
      complement,
      state,
      city,
      zipCode,
    });
  }
}

export default new RecipientController();
