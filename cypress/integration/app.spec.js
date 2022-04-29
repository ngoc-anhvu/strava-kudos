/* eslint-disable */
describe("Strava", () => {
  beforeEach(function () {
    // "this" points at the test context object
    cy.fixture('followers.txt').then((followers) => {
      // "this" is still the test context object
      this.followers = followers
    });
    
    cy.fixture('groups.txt').then((groups) => {
      // "this" is still the test context object
      let arr1 = groups.split(/\r?\n/)
      let arr2 = arr1.map(x => x.split(' ')[0])
      this.groups = arr2
    });
  })

  it("Auto kudos", function () {
    // Visit Strava
    cy.visit("https://www.strava.com/");

    // Login
    cy.get("a.btn-login").click();
    cy.url().should("include", "/login");
    cy.get("#email").should("exist").type(Cypress.env("STRAVA_USERNAME"));
    cy.get("#password").should("exist").type(Cypress.env("STRAVA_PW"), { sensitive: true });
    cy.get("#login-button").should("exist").click();

    // Homepage
    cy.url().should("include", "/dashboard");

    const unfillKudoButtonSelector = "[data-testid=unfilled_kudos]";
    const STRAVA_ATHLETE_PREFIX = "https://www.strava.com/athletes/";

    const groupId = this.groups[Math.floor(Math.random() * this.groups.length)];
    const groupUrl = `https://www.strava.com/clubs/${groupId}/recent_activity`;
    cy.visit(groupUrl);

    cy.get('h1.mb-sm').then(($group) => {
      cy.logInAndOut(`Kudos to ${$group.text().trim()} ${groupUrl}`);
    });

    let count = 0;
    const kudoList = [];
    // Kudos
    cy.scrollTo("bottomLeft", { duration: 2000 });
    cy.wait(2000);
    cy.scrollTo("bottomLeft", { duration: 2000 });
    cy.wait(2000);
    cy.scrollTo("topLeft", { duration: 0 }).then(() => {
      // if (Cypress.$(unfillKudoButtonSelector).length > 0) {
      cy.get(unfillKudoButtonSelector).each(($el, index, $list) => {
        cy.wrap($el)
          // .closest(".react-feed-component")
          .closest('div[data-testid="web-feed-entry"]')
          .within(() => {
            if (count >= 20) return;
            let activityUrl = '';
            cy.get('a[data-testid="activity_name"]').then(($act) => {
              activityUrl = $act.prop("href");
            });

            cy.get('a[data-testid="owners-name"]').then(($owner) => {
              const ownerId = $owner.prop("href")?.split(STRAVA_ATHLETE_PREFIX)[1];
              if (ownerId == Cypress.env("STRAVA_ATHLETE_ID")) {
                cy.logInAndOut(`[IGNORE] same userId`);
                return;
              }
              if (kudoList.includes(ownerId)) {
                cy.logInAndOut(`[IGNORE] ${ownerId} has been kudos`);
                return;
              }
              if (this.followers.includes(ownerId)) {
                cy.logInAndOut(`[IGNORE] ${ownerId} is follower`);
                return;
              }

              count++;
              kudoList.push(ownerId);
              cy.logInAndOut(`[${count}] Kudo to ${$owner.text()} ${activityUrl}`);
              cy.wrap($el).should("exist").click({ force: true });
            });
          });
      });
      // }
    });
  });
});
