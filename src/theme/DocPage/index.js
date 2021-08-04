/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, {useState, useCallback} from 'react';
import {MDXProvider} from '@mdx-js/react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import renderRoutes from '@docusaurus/renderRoutes';
import Layout from '@theme/Layout';
import DocSidebar from '@theme/DocSidebar';
import MDXComponents from '@theme/MDXComponents';
import NotFound from '@theme/NotFound';
import IconArrow from '@theme/IconArrow';
import {matchPath} from '@docusaurus/router';
import {translate} from '@docusaurus/Translate';
import clsx from 'clsx';
import styles from './styles.module.css';
import {ThemeClassNames, docVersionSearchTag} from '@docusaurus/theme-common';

function getSidebar({versionMetadata, currentDocRoute}) {
  function addTrailingSlash(str) {
    return str.endsWith('/') ? str : `${str}/`;
  }

  function removeTrailingSlash(str) {
    return str.endsWith('/') ? str.slice(0, -1) : str;
  }

  const {permalinkToSidebar, docsSidebars} = versionMetadata; // With/without trailingSlash, we should always be able to get the appropriate sidebar
  // note: docs plugin permalinks currently never have trailing slashes
  // trailingSlash is handled globally at the framework level, not plugin level

  const sidebarName =
    permalinkToSidebar[currentDocRoute.path] ||
    permalinkToSidebar[addTrailingSlash(currentDocRoute.path)] ||
    permalinkToSidebar[removeTrailingSlash(currentDocRoute.path)];
  const sidebar = docsSidebars[sidebarName];
  return {
    sidebar,
    sidebarName,
  };
}

function DocPageContent({currentDocRoute, versionMetadata, children}) {
  const {siteConfig, isClient} = useDocusaurusContext();
  const {pluginId, version} = versionMetadata;
  const {sidebarName, sidebar} = getSidebar({
    versionMetadata,
    currentDocRoute,
  });
  const [hiddenSidebarContainer, setHiddenSidebarContainer] = useState(false);
  const [hiddenSidebar, setHiddenSidebar] = useState(false);
  const toggleSidebar = useCallback(() => {
    if (hiddenSidebar) {
      setHiddenSidebar(false);
    }

    setHiddenSidebarContainer(!hiddenSidebarContainer);
  }, [hiddenSidebar]);
  return (
    <Layout
      key={isClient}
      wrapperClassName={ThemeClassNames.wrapper.docPages}
      pageClassName={ThemeClassNames.page.docPage}
      searchMetadatas={{
        version,
        tag: docVersionSearchTag(pluginId, version),
      }}>
      <div className={styles.docPage}>
        {sidebar && (
          <aside
            className={clsx(styles.docSidebarContainer, {
              [styles.docSidebarContainerHidden]: hiddenSidebarContainer,
            })}
            onTransitionEnd={(e) => {
              if (
                !e.currentTarget.classList.contains(styles.docSidebarContainer)
              ) {
                return;
              }

              if (hiddenSidebarContainer) {
                setHiddenSidebar(true);
              }
            }}>
            <DocSidebar
              key={
                // Reset sidebar state on sidebar changes
                // See https://github.com/facebook/docusaurus/issues/3414
                sidebarName
              }
              sidebar={sidebar}
              path={currentDocRoute.path}
              sidebarCollapsible={
                siteConfig.themeConfig?.sidebarCollapsible ?? true
              }
              onCollapse={toggleSidebar}
              isHidden={hiddenSidebar}
            />

            {hiddenSidebar && (
              <div
                className={styles.collapsedDocSidebar}
                title={translate({
                  id: 'theme.docs.sidebar.expandButtonTitle',
                  message: 'Expand sidebar',
                  description:
                    'The ARIA label and title attribute for expand button of doc sidebar',
                })}
                aria-label={translate({
                  id: 'theme.docs.sidebar.expandButtonAriaLabel',
                  message: 'Expand sidebar',
                  description:
                    'The ARIA label and title attribute for expand button of doc sidebar',
                })}
                tabIndex={0}
                role="button"
                onKeyDown={toggleSidebar}
                onClick={toggleSidebar}>
                <IconArrow className={styles.expandSidebarButtonIcon} />
              </div>
            )}
          </aside>
        )}
        <main
          className={clsx(styles.docMainContainer, {
            [styles.docMainContainerEnhanced]:
              hiddenSidebarContainer || !sidebar,
          })}>
         
          <div
            className={clsx(
              'container padding-bottom--lg',
              styles.docItemWrapper,
              {
                [styles.docItemWrapperEnhanced]: hiddenSidebarContainer,
              },
            )}>
{ currentDocRoute.path === "/" && <div className="intro-parent">
              <div className="intro-banner">
                <div className="container">
                  <div className=" col intro-text">
                    <h1>Welcome to the <span className="gradient">Tezos</span> Wiki!</h1>
                    <p>The Tezos Wiki is a place to get started and learn about Tezos. It also aims to answer the frequently asked questions about the Tezos protocol & the Tezos ecosystem.</p>
                  </div>
                </div>
              </div>
            </div>
            
            }
            <MDXProvider components={MDXComponents}>{children}</MDXProvider>
            
          
          </div>
        </main>
      </div>
      
    </Layout>
  );
}

function DocPage(props) {
  const {
    route: {routes: docRoutes},
    versionMetadata,
    location,
  } = props;
  const currentDocRoute = docRoutes.find((docRoute) =>
    matchPath(location.pathname, docRoute),
  );

  if (!currentDocRoute) {
    return <NotFound {...props} />;
  }

  return (
    <DocPageContent
      currentDocRoute={currentDocRoute}
      versionMetadata={versionMetadata}>
      {renderRoutes(docRoutes, {
        versionMetadata,
      })}
    </DocPageContent>
  );
}

export default DocPage;
