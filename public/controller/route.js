import * as Home from '../viewpage/home_page.js'
import * as About from '../viewpage/about_page.js'
import * as ThreadPage from '../viewpage/thread_page.js'

export const routePath = {
    HOME: '/',
    ABOUT: '/about',
    THREAD: '/thread',
}

export const routes = [
    {path: routePath.HOME, page: Home.home_page},
    {path: routePath.ABOUT, page: About.about_page},
    {path: routePath.THREAD, page: ThreadPage.thread_page},
]

export function routing(pathname, hash) {
    const route = routes.find(r => r.path == pathname);
    if (route) route.page(hash.substring(1));
    else routes[0].page();
}