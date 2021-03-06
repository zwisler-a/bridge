import 'reflect-metadata';

import { EndpointConfig, EndpointConfigInternal } from '../interfaces/external/endpoint-config.interface';
import { CustomParamConfig } from '../interfaces/internal/custom-param.interface';
import { Type } from '../interfaces/internal/type.interface';
import { $args } from '../util/get-parameter.function';

const defaultConfig: EndpointConfig = {
    method: 'GET'
};
/**
 * Rest Endpoint. A method which can be called on the server
 * @example
 * @Endpoint()
 * private myFunc(){
 *  return 'Hello World';
 * }
 * @param config Configuration of the Endpoint
 */
export function Endpoint(config: EndpointConfig = {}) {
    return function(target, propertyKey: string, descriptor: PropertyDescriptor) {
        // Generate param lists (type, names) and a list with the parameters required from a request
        const parameterTypes: Type<any>[] = (Reflect.getMetadata('design:paramtypes', target, propertyKey) || []).map(
            (type: Type<any>) => new type()
        );
        const parameterNames: string[] = $args(descriptor.value);
        let requiredParams = [].concat(parameterNames);

        const customParams: { [key: string]: CustomParamConfig } = {};
        (Reflect.getOwnMetadata('customParam', target, propertyKey) || []).forEach((param: CustomParamConfig) => {
            param.parameterName = parameterNames[param.index];
            customParams[parameterNames[param.index]] = param;
            requiredParams = requiredParams.filter((val, idx) => idx !== param.index);
        });

        const epConfig: EndpointConfigInternal = Object.assign({}, defaultConfig, config, {
            parameterNames,
            requiredParams,
            parameterTypes,
            customParams,
            route: config.route || propertyKey
        });

        const proto = target.constructor.prototype;
        if (!proto['_bridge']) {
            Object.defineProperty(proto, '_bridge', {
                value: { endpoints: [] }
            });
        }
        const bridge = proto['_bridge'];
        bridge.endpoints.push({ method: descriptor.value, config: epConfig });
    };
}
