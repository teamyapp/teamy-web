import React, { createRef, RefObject } from 'react';
import { createRoot } from 'react-dom/client';

import { Deps, initDeps } from '@core/dep/deps';

import { AppComponent } from './components/App.component';
import './index.scss';
import reportWebVitals from './reportWebVitals';
import { initRouter } from './routing/init';

const deps = initDeps();

const appRef = createRef<AppComponent>();
initRouter(deps, appRef);

const root = createRoot(document.getElementById('root')!);
root.render(
    <React.StrictMode>
        <AppComponent ref={appRef} deps={deps} />
    </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
