import { expectType } from 'tsd';
import * as rasti from 'rasti';
import Emitter from 'rasti/Emitter';
import EmitterJs from 'rasti/Emitter.js';
import Model from 'rasti/Model';
import ModelJs from 'rasti/Model.js';
import View from 'rasti/View';
import ViewJs from 'rasti/View.js';
import Component from 'rasti/Component';
import ComponentJs from 'rasti/Component.js';

/*
 * Public subpaths resolve, with and without `.js`, to the same types as the root entry
 */
expectType<typeof rasti.Emitter>(Emitter);
expectType<typeof rasti.Emitter>(EmitterJs);
expectType<typeof rasti.Model>(Model);
expectType<typeof rasti.Model>(ModelJs);
expectType<typeof rasti.View>(View);
expectType<typeof rasti.View>(ViewJs);
expectType<typeof rasti.Component>(Component);
expectType<typeof rasti.Component>(ComponentJs);
