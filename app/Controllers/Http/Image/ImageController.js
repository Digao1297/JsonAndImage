"use strict";

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
const Database = use("Database");
const Image = use("App/Models/Image");

/**
 * Resourceful controller for interacting with images
 */
class ImageController {
  /**
   * Show a list of all images.
   * GET images
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index() {
    return Image.all();
  }

  /**
   * Create/save a new image.
   * POST images
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response }) {
    const trx = await Database.beginTransaction();

    try {
      const data = request.only(["path"]);

      const image = await Image.create(data, trx);

      await trx.commit();

      return response.status(201).send({
        image,
      });
    } catch (error) {
      await trx.rollback();
      return response.status(error.status).send({
        message: "Erro ao cadastrar imagem",
      });
    }
  }

  /**
   * Display a single image.
   * GET image/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async show({ params: { id }, response }) {
    try {
      const image = await Image.findOrFail(id);

      return response.send(image);
    } catch (error) {
      return response.status(error.status).send({
        message: "Ops está imagem não existe! :(",
      });
    }
  }

  /**
   * Update image details.
   * PUT or PATCH images/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params: { id }, request, response }) {
    const trx = await Database.beginTransaction();

    try {
      const image = await Image.findOrFail(id);

      const { path } = request.all();

      image.merge({ path });

      await image.save(trx);

      await trx.commit();

      return response.send(image);
    } catch (error) {
      await trx.rollback();
      return response.status(error.status).send({
        message: "Erro ao atualizar os dados da imagem! :(",
      });
    }
  }

  /**
   * Delete a image with id.
   * DELETE images/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params: { id }, request, response }) {
    const trx = await Database.beginTransaction();

    try {
      const image = await Image.findOrFail(id);

      await image.delete(trx);

      await trx.commit();

      return response.status(204).send();
    } catch (error) {
      await trx.rollback();
      return response.status(error.status).send({
        message: "Erro ao deletar a Imagem :(",
      });
    }
  }
}

module.exports = ImageController;
