import * as express from "express";

import { IUser, IUserService } from "./identity";
import { inject as inversifyInject, injectable as inversifyInjectable, optional as inversifyOptional, interfaces } from "inversify";
import { Entity, ObjectIdColumn, Column, ManyToMany, PrimaryColumn, PrimaryGeneratedColumn, ManyToOne, OneToMany, OneToOne } from "typeorm"

/**
 * alias for inversify.injectable
 */
export const injectable = inversifyInjectable;

/**
 * alias for inversify.inject
 */
export const inject = inversifyInject;

/**
 * alias for inversify.optional
 */
export const optional = inversifyOptional;

/**
 * alias for typeorm.Entity
 */
export const entity = Entity;

/**
 * alias for typeorm.ObjectIdColumn
 */
export const objectIdColumn = ObjectIdColumn;

/**
 * alias for typeorm.PrimaryColumn
 */
export const primaryColumn = PrimaryColumn;

/**
 * alias for typeorm.PrimaryColumn
 */
export const primaryGeneratedColumn = PrimaryGeneratedColumn;

/**
 * alias for typeorm.Column
 */
export const column = Column;

/**
 * alias for typeorm.ManyToMany
 */
export const manyToMany = ManyToMany;

/**
 * alias for typeorm.ManyToOne
 */
export const manyToOne = ManyToOne;

/**
 * alias for typeorm.OneToMany
 */
export const oneToMany = OneToMany;

/**
 * alias for typeorm.OneToOne
 */
export const oneToOne = OneToOne;

/**
 * alias for inversify.interfaces.Container
 */
export type DiContainer = interfaces.Container;

/**
 * extends express.NextFunction
 */
export interface NextFunction extends express.NextFunction { }

/**
 * extends express.Request
 */
export interface Request extends express.Request { }

/**
 * extends express.Response
 */
export interface Response extends express.Response { }

/**
 * alias for express.RequestHandler
 */
export interface Middleware extends express.RequestHandler { }

/**
 * alias for express.ErrorRequestHandler
 */
export interface ErrorMiddleware extends express.ErrorRequestHandler { }