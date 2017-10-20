import { ManagementUiPage } from './app.po';

describe('management-ui App', () => {
  let page: ManagementUiPage;

  beforeEach(() => {
    page = new ManagementUiPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
