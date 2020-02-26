import { format } from 'date-fns';
import Mail from '../../lib/Mail';

class CanceledMail {
  // Chave únca do job
  get key() {
    return 'CanceledMail';
  }

  async handle({ data }) {
    const { delivery, deliveryman, deliveryProblem } = data;

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Delivery canceled',
      template: 'canceled-delivery',
      context: {
        deliveryman: deliveryman.name,
        id: delivery.id,
        description: deliveryProblem.description,
        date: format(new Date(), "MMMM' 'dd', 'yyyy"),
      },
    });
  }
}

export default new CanceledMail();
