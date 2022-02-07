/* eslint-disable */
describe("Strava", () => {
  it("Auto kudos", () => {
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

    const groups = [
      '475936', // Thích chạy bộ
      '211129', // Vietnam Trail Series
      '185074', // Chay365
      '497461', // Chinh Phục Hồ Tây
      '257573', // Chạy bộ cuối tuần
      '264521', // Chạy Cho Khỏe
      '520161', // SacombankRunners
      '476043', // Run4Self
      '127716', // VietRunners
      '297941', // 21Km - We Can Run
      '163276', // SRC - Sunday Running Club
      '458366', // Techcombank
      '523568', // adidas runners Saigon
      '478188', // Techcombank - Marathon
      '539341', // RUN365 VIỆT NAM
      '230974', // VNG Run Club
      '460934', // Longpt Friends
      '193097', // Yêu Chạy Bộ
      '463356', // Garmin Vietnam
      '855444', // MAF VietNam
      '285464', // Run To Eat
      '586241', // YÊU CHẠY BỘ
    ];

    const unfillKudoButtonSelector = "[data-testid=unfilled_kudos]";
    const STRAVA_ATHLETE_PREFIX = "https://www.strava.com/athletes/";

    const groupId = groups[Math.floor(Math.random() * groups.length)];
    const groupUrl = `https://www.strava.com/clubs/${groupId}/recent_activity`;
    cy.logInAndOut(`Kudos to ${groupUrl}`);
    cy.visit(groupUrl);

    let count = 0;
    // Kudos
    cy.scrollTo("bottomLeft", { duration: 2000 });
    cy.wait(2000);
    cy.scrollTo("bottomLeft", { duration: 2000 });
    cy.wait(2000);
    cy.scrollTo("topLeft", { duration: 0 }).then(() => {
      if (Cypress.$(unfillKudoButtonSelector).length > 0) {
        cy.get(unfillKudoButtonSelector).each(($el, index, $list) => {
          cy.wrap($el)
            .closest(".react-feed-component")
            .within(() => {
              if (count > 20) return;
              cy.get('a[data-testid="owners-name"]').then(($owner) => {
                const ownerId = $owner.prop("href")?.split(STRAVA_ATHLETE_PREFIX)[1];
                if (ownerId !== Cypress.env("STRAVA_ATHLETE_ID")) {
                  count++;
                  cy.logInAndOut(`[${count}] Kudo to ${$owner.text()}`);
                  cy.wrap($el).should("exist").click({ force: true });
                }
              });
            });
        });
      }
    });
  });
});
