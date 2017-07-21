import * as inversify from "inversify";

// Inversify
export const Container = new inversify.Container();
Container.bind<inversify.Container>(inversify.Container).toConstantValue(Container);
