import "reflect-metadata";

import * as express from "express";

import { injectable, inject, interfaces } from "inversify";

export const Injectable = injectable;

export const Inject = inject;

export type Middleware = express.RequestHandler;

export type ErrorMiddleware = express.ErrorRequestHandler;

export type PathIdentifier = (string | RegExp | (string | RegExp)[]);

export type FultonDiContainer = interfaces.Container;

export interface Request extends express.Request {
}

export interface Response extends express.Response {
}
