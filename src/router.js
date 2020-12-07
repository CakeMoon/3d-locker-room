import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)



export default new Router({
    mode: 'history',
    duplicateNavigationPolicy: 'ignore',
    routes: [
        {   path: '/',
            component: () => import('./views/Account.vue'),
        },
        {   path: '/preview',
            component: () => import('./views/Preview.vue'),
        },
        {   path: '/images',
            component: () => import('./views/ImagePage.vue'),
        },
        {   path: '/model3ds',
        component: () => import('./views/ModelPage.vue'),
        },
        {   path: '/hints',
        component: () => import('./views/Hints.vue'),
        },
    ]
})

       
