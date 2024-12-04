import { NextFunction, Request, Response } from 'express';
import InvalidDataError from '../errors/invalid_data_error';
import errorWrapper from '../errors/error_wrapper';
import { checkUserAuth } from '../user/controllers';
import Card from './model';

export const getCards = (
  _: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => Card.find({})
  .populate('owner')
  .populate('likes')
  .then((cards) => res.send(cards))
  .catch(next);

export const postCard = (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const {
    name,
    link,
    user: { _id },
  } = req.body;
  if (!name || !link) {
    return Promise.reject(new InvalidDataError()).catch(next);
  }
  return checkUserAuth(_id)
    .then((user) => Card.create({ name, link, owner: user._id }))
    .then((card) => card.populate('owner'))
    .then((card) => res.send(card))
    .catch(next);
};

export const deleteCard = (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const { cardId } = req.params;
  return Card.findByIdAndDelete(cardId)
    .then((card) => {
      if (!card) {
        throw new InvalidDataError('Запрашиваемый пост не найден');
      }
      res.send({ message: 'Пост удален' });
    })
    .catch(next);
};

export const likeCard = (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const { cardId } = req.params;
  const { _id } = req.body.user;
  return checkUserAuth(_id)
    .then((user) => Card.findByIdAndUpdate(
      cardId,
      { $addToSet: { likes: user._id } },
      { new: true },
    ))
    .then((card) => Promise.resolve(card))
    .then((card) => card?.populate('owner'))
    .then((card) => card?.populate('likes'))
    .then((card) => res.send(card))
    .catch(errorWrapper(next));
};

export const dislikeCard = (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  const { cardId } = req.params;
  const { _id } = req.body.user;
  return checkUserAuth(_id)
    .then((user) => Card.findByIdAndUpdate(
      cardId,
      { $pull: { likes: user._id } },
      { new: true },
    ))
    .then((card) => res.send({ data: card }))
    .catch(errorWrapper(next));
};