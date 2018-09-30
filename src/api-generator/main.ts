import * as fs from 'fs';

import { Endpoint } from '../interfaces/endpoint.interface';
import { expressServer } from '../server.class';
import { generateService } from './generate-service.function';
import { Type } from '../interfaces/type.interface';
import { generateInterface } from './generate-interface.function';
import { generateModule } from './generate-module.function';
import { apiResponseInterface } from './api-response.template';

export function generateApi(outputPath: string) {
    const orderedEndpoints = orderByService(expressServer.endpoints);
    const requiredTypes = [];
    mkDirs(outputPath);
    expressServer.routes
        .map(service => {
            const serviceRes = generateService(service, orderedEndpoints[service.constructorFunction.name]);
            requiredTypes.push(...serviceRes.requiredTypes);
            return serviceRes;
        })
        .forEach(service => {
            fs.writeFileSync(outputPath + service.serviceName + '.service.ts', service.template);
        });
    requiredTypes.forEach((type: Type<any>) => {
        const typeInterface = generateInterface(type);
        fs.writeFileSync(outputPath + 'interfaces/' + typeInterface.name + '.interface.ts', typeInterface.template);
    });

    fs.writeFileSync(outputPath + 'interfaces/api-response.interface.ts', apiResponseInterface);

    fs.writeFileSync(outputPath + 'api.module.ts', generateModule(expressServer.routes));

}

function orderByService(endpoints: Endpoint[]) {
    const services = {};
    endpoints.forEach(endpoint => {
        if (services[endpoint.route.constructorFunction.name]) {
            services[endpoint.route.constructorFunction.name].push(endpoint);
        } else {
            services[endpoint.route.constructorFunction.name] = [endpoint];
        }
    });
    return services;
}

function mkDirs(outputPath) {
    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath);
    }
    if (!fs.existsSync(outputPath + 'interfaces/')) {
        fs.mkdirSync(outputPath + 'interfaces/');
    }
}
