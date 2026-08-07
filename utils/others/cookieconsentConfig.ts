/**
 * @description
 * Configuration for the cookie consent banner using the "vanilla-cookieconsent" library.
 * Customizes the appearance, behavior, and text for the consent and preferences modals.
 * For more configuration options, visit: https://cookieconsent.orestbida.com/
 */
import * as CookieConsent from "vanilla-cookieconsent";

const cookieconsentConfig: CookieConsent.CookieConsentConfig = {
  revision: 0,
  guiOptions: {
    consentModal: {
      layout: "box",
      position: "bottom right",
      equalWeightButtons: true,
      flipButtons: false,
    },
    preferencesModal: {
      layout: "box",
      position: "right",
      equalWeightButtons: true,
      flipButtons: false,
    },
  },
  categories: {
    necessary: {
      readOnly: true,
    },
    // functionality: {},
    // analytics: {},
  },
  language: {
    default: "en",
    autoDetect: "browser",
    translations: {
      en: {
        consentModal: {
          title: "We value your privacy",
          // description:
          //   'We use cookies to enhance your experience and provide personalized content. By clicking "I  understand", you consent to our use of cookies.',
          description:
            "We use necessary cookies to ensure the proper functioning of our website. By clicking '<strong>I understand</strong>,' you consent to the use of necessary cookies.",
          acceptAllBtn: "I understand",
          // acceptNecessaryBtn: "Reject all",
          // showPreferencesBtn: "Manage preferences",
          footer:
            '<a href="/privacy">Privacy Policy</a>\n<a href="/terms">Terms and Conditions</a>',
        },
        preferencesModal: {
          title: "Manage Your Cookie Preferences",
          acceptAllBtn: "I understand",
          // acceptNecessaryBtn: "Reject all",
          savePreferencesBtn: "Save my preferences",
          closeIconLabel: "Close modal",
          sections: [
            {
              title:
                'Strictly Necessary Cookies <span class="pm__badge">Always Enabled</span>',
              description:
                "Necessary cookies are required to enable the basic features of this site, such as providing secure log-in or adjusting your consent preferences. These cookies do not store any personally identifiable data.",
              linkedCategory: "necessary",
            },
            // {
            //   title: "Functionality Cookies",
            //   description:
            //     "Functional cookies help perform certain functionalities like sharing the content of the website on social media platforms, collecting feedback, and other third-party features.",
            //   linkedCategory: "functionality",
            // },
            // {
            //   title: "Performance and Analytics",
            //   description:
            //     "Analytical cookies are used to understand how visitors interact with the website. These cookies help provide information on metrics such as the number of visitors, bounce rate, traffic source, etc.<br />Analytical cookies are used to understand how visitors interact with the website. These cookies help provide information on metrics such as the number of visitors, bounce rate, traffic source, etc. ",
            //   linkedCategory: "analytics",
            // },
            {
              title: "More Information",
              description:
                'You can find more information about cookies and how we use them in our <a href="/privacy-policy">Privacy Policy</a>. For more queries, please <a href="mailto:contact@alphadrafts.com">email us</a>.',
            },
          ],
        },
      },
    },
  },
  onFirstConsent: () => {
    // logConsent();
  },
  onChange: () => {
    // logConsent();
  },
};
export default cookieconsentConfig;

// Default values for cookie and preferences
export const defaultCookie: CookieConsent.CookieValue = {
  categories: ["necessary"],
  revision: 0,
  data: null,
  consentTimestamp: "",
  consentId: "",
  services: {
    necessary: [],
  },
  lastConsentTimestamp: "",
  expirationTime: 0,
  languageCode: "",
};

export const defaultPreferences: CookieConsent.UserPreferences = {
  acceptType: "all",
  acceptedCategories: ["necessary"],
  rejectedCategories: [],
  acceptedServices: {
    necessary: [],
  },
  rejectedServices: {
    necessary: [],
  },
};
