import * as events from 'events';
import { Category, Simulation } from '../../steps/types';
import swal from 'sweetalert2';

declare interface sweetalert2 {
    (...args: any[]): void
}

declare global {
    interface Navigator {
        languages: string[],
        userLanguage: string
    }

    interface Window {
        importedData: {
            languageMappings: { [langCode: string]: string },
            simsByLanguage: {
                [langCode: string]: Simulation[]
            }
        },
        lsPrefix: string
    }
}


var navigatorLanguage = (window.navigator &&
    ((window.navigator.languages && window.navigator.languages[0]) ||
        window.navigator.userLanguage ||
        window.navigator.language)
) || 'en';

navigatorLanguage = window.importedData.languageMappings[navigatorLanguage.split('-')[0]]
var languageToUse = window.importedData.simsByLanguage[navigatorLanguage] ? navigatorLanguage : Object.keys(window.importedData.simsByLanguage)[0];

var currentLanguage = (localStorage && localStorage[window.lsPrefix + 'currentLanguage']) ?
    localStorage[window.lsPrefix + 'currentLanguage'] :
    languageToUse;

var ractive = new Ractive({
    el: '#ractive-target',
    template: '#ractive-template',
    computed: {
        languages: function () {
            return Object.keys(this.get('simulationsByLanguage'));
        }
    },
    data: {
        simulationsByLanguage: window.importedData.simsByLanguage,
        selectedLanguage: currentLanguage,
        languageMappings: window.importedData.languageMappings
    },
    oninit: function () {
        this.observe('selectedLanguage', function (selectedLanguage) {
            if (localStorage) {
                localStorage[window.lsPrefix + 'currentLanguage'] = selectedLanguage;
            };
        });
        this.on('showConfirm', function (ev) {
            const simulation: Simulation = ev.context;

            const categoryHTML = simulation.categories.map(cat => {
                const categoryContent = cat.map(c => {
                    return c.title;
                }).join(' / ');
                return `<li>${categoryContent}</li>`;
            });

            swal({
                title: `${simulation.title}`,
                html: `<img src='../I/${simulation.id}.png' />
                <ul>${categoryHTML}</ul>
                <div class='description'>${simulation.description}</div>
                <div class='topics'>${simulation.topics}</div>`,
                showCloseButton: true,
                showCancelButton: true
            }).then(() => {
                (<any>window).location = `${simulation.id}_${simulation.language}.html`;
            });
        });
    }
});