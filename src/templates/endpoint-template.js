import { html } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import marked from 'marked';
import '@/components/api-request';
import '@/components/api-response';

/* eslint-disable indent */
function toggleExpand(path) {
  if (path.expanded) {
    path.expanded = false; // collapse
  } else {
    path.expanded = true; // Expand
  }
  this.requestUpdate();
}

function endpointHeadTemplate(path) {
  return html`
  <div @click="${(e) => { toggleExpand.call(this, path, e); }}" class='endpoint-head ${path.method} ${path.expanded ? 'expanded' : 'collapsed'}'>
    <div class="method ${path.method}"> ${path.method} </div> 
    <div class="path ${path.deprecated ? 'deprecated' : ''}"> 
      ${path.path} 
    </div>
    ${path.deprecated
      ? html`
        <span style="font-size:12px; text-transform:uppercase; font-weight:bold; color:var(--red); margin:2px 0 0 5px;"> 
          deprecated 
        </span>`
      : ''
    }
    <div class="only-large-screen" style="min-width:60px; flex:1"></div>
    <div class="m-markdown-small descr"> ${unsafeHTML(marked(path.summary || ''))} </div>
  </div>
  `;
}

function endpointBodyTemplate(path) {
  let accept = '';
  for (const respStatus in path.responses) {
    for (const acceptContentType in (path.responses[respStatus].content)) {
      accept = `${accept + acceptContentType}, `;
    }
  }
  accept = accept.replace(/,\s*$/, ''); // remove trailing comma

  return html`
  <div class='endpoint-body ${path.method}'>
    ${path.summary || path.description
      ? html`
        <div class="summary">
          <div class="title">${path.summary}</div>
          ${path.summary !== path.description
            ? html`
              <div class="m-markdown"> 
                ${unsafeHTML(marked(path.description || ''))}
              </div>`
            : ''
          }  
        </div>`
      : ''
    }
    <div class='req-resp-container'> 
      <api-request  class="request"  
        method = "${path.method}", 
        path = "${path.path}" 
        .parameters = "${path.parameters}" 
        .request_body = "${path.requestBody}"
        api-key-name = "${this.apiKeyName ? this.apiKeyName : ''}" 
        api-key-value = "${this.apiKeyValue ? this.apiKeyValue : ''}" 
        api-key-location = "${this.apiKeyLocation ? this.apiKeyLocation : ''}" 
        selected-server = "${this.selectedServer}" 
        active-schema-tab = "${this.defaultSchemaTab}" 
        allow-try = "${this.allowTry}"
        accept = "${accept}"
        schema-style = "${this.schemaStyle}" 
        schema-expand-level = "${this.schemaExpandLevel}"
        schema-description-expanded = "${this.schemaDescriptionExpanded}"
      > </api-request>

      <api-response  
        class="response" 
        .responses="${path.responses}"
        active-schema-tab = "${this.defaultSchemaTab}" 
        schema-style="${this.schemaStyle}"
        schema-expand-level = "${this.schemaExpandLevel}"
        schema-description-expanded = "${this.schemaDescriptionExpanded}"
      > </api-response>
    </div>
  </div>`;
}

export default function endpointTemplate() {
  return html`
    ${this.resolvedSpec.tags.map((tag) => html`
    <div class='regular-font section-gap'> 
      <div id='${tag.name.replace(/[\s#:?&=]/g, '-')}' class="sub-title tag">${tag.name}</div>
      <div class="regular-font-size">
        ${tag.description
          ? html`
            ${unsafeHTML(`<div class='m-markdown regular-font'>${marked(tag.description)}</div>`)}`
          : ''
        }
      </div>
    </div>
    ${tag.paths.filter((v) => {
      if (this.matchPaths) {
        return `${v.method} ${v.path}`.includes(this.matchPaths);
      }
      return true;
    }).map((path) => html`
      <div id='${path.method}-${path.path.replace(/[\s#:?&=]/g, '-')}' class='m-endpoint regular-font ${path.method} ${path.expanded ? 'expanded' : 'collapsed'}'>
        ${endpointHeadTemplate.call(this, path)}      
        ${path.expanded ? endpointBodyTemplate.call(this, path) : ''}
      </div>
    `)
    }`)
  }`;
}
