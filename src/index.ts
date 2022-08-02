// TODO: Première lettre amène au premier pays de la lettre

document.addEventListener('DOMContentLoaded', () => {
  // Declaration of useful variables
  const dropdown: HTMLElement | null = document.querySelector('[data-element="dropdown"]');
  const list: HTMLElement | null = document.querySelector('[data-element="list"]');
  const item: HTMLElement | null = document.querySelector('[data-element="item"]');
  const hiddenInput: HTMLElement | null = document.querySelector('input[name="countryCode"]');

  (async () => {
    // Clear the list
    list && (list.innerHTML = '');

    // Find user location
    const location = await getLocation();
    // Fetch countries from the API
    const countries = await getCountries();

    // Loop through all countries and populate list items
    for (const country of countries) {
      if (item) {
        const cloneItem = item.cloneNode(true) as HTMLElement;

        // Populating the item clone
        cloneItem.title = country.name.common;
        cloneItem.setAttribute('aria-title', country.name.common);
        cloneItem.setAttribute('data-cca2', country.cca2);
        (cloneItem.querySelector('[data-element="value"]') as HTMLElement).innerHTML = country.cca2;
        (cloneItem.querySelector('img') as HTMLImageElement).src = country.flags.svg;
        (cloneItem.querySelector('img') as HTMLImageElement).alt = country.name.common + ' Flag';

        // Create a click event listener
        cloneItem.addEventListener('click', () => {
          // Reset Aria attributes and Webflow's current states
          if (list) {
            list.querySelectorAll('[data-element="item"]').forEach((e) => {
              e.setAttribute('aria-selected', 'false');
              e.classList.remove('w--current');
            });
          }
          // Set the Aria attribute and Webflow's current state
          cloneItem.setAttribute('aria-selected', 'true');
          cloneItem.classList.add('w--current');
          // Set the dropdown values
          (dropdown?.querySelector('[data-element="flag"]') as HTMLImageElement).src =
            country.flags.svg;
          (dropdown?.querySelector('[data-element="flag"]') as HTMLImageElement).alt =
            country.name.common + ' Flag';
          (dropdown?.querySelector('[data-element="value"]') as HTMLElement).innerHTML =
            country.idd.root + (country.idd.suffixes.length === 1 ? country.idd.suffixes : '');
          // Set the hidden input value
          hiddenInput?.setAttribute('value', country.cca2);
        });
        // Append the clone to the list
        list?.appendChild(cloneItem);
      }
    }

    // Set default location on load
    (
      document.querySelector(
        '[data-element="item"][data-cca2="' + location + '"]'
      ) as HTMLAnchorElement
    ).click();

    // Observe class' change for dropdown 'open' state
    const observer = new MutationObserver((e) => {
      e.forEach(function (mutation) {
        if ((mutation.target as HTMLElement).classList.contains('w--open')) {
          // Get the current selection
          const selected = document.querySelector('.w--current') as HTMLElement;
          let focused = selected;

          // Scroll into view and center
          selected.focus();
          if (list) {
            list.scrollTop = selected.offsetTop + selected.offsetHeight / 2 - list.offsetHeight / 2;

            // Listen for keyboard navigation
            list.addEventListener('keydown', function (e) {
              switch (e.code) {
                case 'ArrowUp':
                  focused = focused.previousElementSibling as HTMLElement;
                  focused.focus();
                  break;
                case 'ArrowDown':
                  focused = focused.nextElementSibling as HTMLElement;
                  focused.focus();
                  break;
                case 'Tab':
                  e.preventDefault();
                  focused = focused.nextElementSibling as HTMLElement;
                  focused.focus();
                  break;
                case 'Space':
                  e.preventDefault();
                  focused.click();
                  break;
              }
            });
          }
        }
      });
    });

    if (dropdown) {
      observer.observe(dropdown.querySelector('.w-dropdown-toggle') as HTMLElement, {
        attributes: true,
        attributeFilter: ['class'],
        childList: false,
        characterData: false,
      });
    }
  })();
});

// Fetch countries
const getCountries = async () => {
  try {
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flags,idd');
    return await response.json();
  } catch (e) {
    return [];
  }
};

// Trace user location
const getLocation = async () => {
  try {
    const response = await fetch('https://1.1.1.1/cdn-cgi/trace');
    const text = await response.text();

    let data = text.replace(/[\r\n]+/g, '","').replace(/\=+/g, '":"');
    data = '{"' + data.slice(0, data.lastIndexOf('","')) + '"}';
    const trace = JSON.parse(data);

    return trace.loc;
  } catch (e) {
    return 'US';
  }
};
