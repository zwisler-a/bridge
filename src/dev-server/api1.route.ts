import { CustomParam } from '../decorators/custom-param.decorator';
import { Endpoint } from '../decorators/endpoint.decorator';
import { Route } from '../decorators/route.decorator';
import { Service1 } from './test.service';
import { Live } from '../decorators/live.decorator';
import { setInterval } from 'timers';

@Route({
    basePath: '/tests',
    middleware: [
        (req, res, next) => {
            console.log('Service');
            next();
        }
    ]
})
export class Api1 {
    @Live({ path: 'asd' })
    public testData;

    @Live({ path: 'asd2' })
    public testData2;

    constructor(private log: Service1) {
        setInterval(() => {
            this.testData = Math.random;
        }, 1000);
    }

    @Endpoint({
        middleware: [
            (req, res, next) => {
                console.log('Endpoint');
                next();
            }
        ]
    })
    test() {
        this.testData = Math.random();
        this.testData2 = { rnd: Math.random() };
        return true;
    }
    @Endpoint()
    async test2() {
        throw new Error();
    }
    @Endpoint()
    test3(param: string): string {
        return param;
    }
    @Endpoint()
    test4(param: string, @CustomParam('url') url): string {
        console.log(url);
        return url;
    }
}
