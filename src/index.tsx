import React from 'react';
import ReactDOM from 'react-dom';
import AppComponentContainer from './components/App.component';
import { initDeps } from './deps';
import './index.scss';
import reportWebVitals from './reportWebVitals';

const deps = initDeps();

ReactDOM.render(
    <React.StrictMode>
        <AppComponentContainer
            taskService={deps.taskService}
            executionModeService={deps.executionModeService}
        />
    </React.StrictMode>,
    document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
