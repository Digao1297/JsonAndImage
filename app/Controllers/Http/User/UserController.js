"use strict";

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
const Database = use("Database");
const Helpers = use("Helpers");
const Image = use("App/Models/Image");
const User = use("App/Models/User");

/**
 * Resourceful controller for interacting with users
 */
class UserController {
  /**
   * Show a list of all users.
   * GET users
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index() {
    return User.all();
  }

  /**
   * Create/save a new user.
   * POST users
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response }) {
    const trx = await Database.beginTransaction();

    try {
      const { name } = request.all();
      const images = request.file("images", {
        types: ["image"],
        size: "2mb",
      });

      await images.moveAll(Helpers.tmpPath("uploads"), (file) => ({
        name: `${Date.now()}-${file.clientName}`,
      }));

      if (!images.movedAll()) {
        return images.errors();
      }

      const user = await User.create({ name }, trx);
      try {
        await Promise.all(
          images
            .movedList()
            .map((image) => user.images().create({ path: image.fileName }, trx))
        );
      } catch (error) {
        console.log(error);
      }

      await trx.commit();

      const imageData = await user.images().fetch();

      return response.status(201).send({
        user,
        imageData,
      });
    } catch (error) {
      return response.status(error.status).send({
        message: "Erro ao cadastrar usuario",
      });
    }
  }

  /**
   * Display a single user.
   * GET users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params, request, response, view }) {}

  /**
   * Update user details.
   * PUT or PATCH users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response }) {}

  /**
   * Delete a user with id.
   * DELETE users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, request, response }) {}
}

module.exports = UserController;
