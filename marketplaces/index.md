# Marketplace directory

Every marketplace in the catalog, with its access model, regions, coverage, and official documentation. Search by name, API, region, or tag. The search box in the top bar also finds text inside the guides.

<!-- markdownlint-disable MD033 -->
<MarketplaceDirectory />
<!-- markdownlint-enable MD033 -->

## Coverage notes

“Documented” means the cited provider documentation was reviewed for the stated scope. It does not mean that an API connection has been built or tested. Amazon SP-API has the deepest coverage: operation-level dossiers, workflows, and onboarding guides. TikTok Shop has a source-linked API-family directory with focused guides for authorization, products, orders, fulfillment, returns, and events, plus the partner operation Get Authorized Category Assets version 202405. Coverage for both is partial; open each guide for its scope, access requirements, and sources.

Counts come from the catalog and the published pages. API surfaces are the surfaces recorded in `catalog/marketplaces.yaml`. Reference pages are the pages in a marketplace's `apis/` folder, not counting its index page. A topic counts as covered when `catalog/guides.yaml` lists a guide on it for that marketplace.

To request or contribute another marketplace guide, see the repository's [contribution instructions](https://github.com/muhammadrakib2299/Marketplace-integration-playbook/blob/main/CONTRIBUTING.md) and [README](https://github.com/muhammadrakib2299/Marketplace-integration-playbook#add-a-marketplace).
