import { RouteE } from '../Routes';
export async function onSubmit(_data) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return Promise.reject(new Error('No backend connected'));
}
export function onCancel(history) {
    history.push(`./${RouteE.Wizards}`);
}
//# sourceMappingURL=utils.js.map