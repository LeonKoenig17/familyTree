import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { treeData } from '../treeData';
import { TreeNode } from './tree-node/tree-node';
import { PersonNode } from '../treeData';

declare const LeaderLine: any;

@Component({
  selector: 'app-tree',
  standalone: true,
  imports: [TreeNode],
  templateUrl: './tree.html',
  styleUrls: ['./tree.scss'],
})
export class Tree implements AfterViewInit, OnDestroy {
  treeData = treeData;

  // grab every rendered app-card host element
  @ViewChildren('cardHost', { read: ElementRef })
  // (we’ll set #cardHost on app-card below; see note)
  cardHosts!: QueryList<ElementRef<HTMLElement>>;

  private lines: any[] = [];
  private rebuildQueued = false;

  ngAfterViewInit() {
    this.buildLines();
    this.cardHosts.changes.subscribe(() => this.queueRebuild());
  }

  @HostListener('window:resize')
  onResize() { this.queueRebuild(); }

  @HostListener('window:scroll')
  onScroll() { this.queueRebuild(); }

  private queueRebuild() {
    if (this.rebuildQueued) return;
    this.rebuildQueued = true;
    requestAnimationFrame(() => {
      this.rebuildQueued = false;
      this.buildLines();
    });
  }

  private buildLines() {
    this.removeLines();

    // Map node id -> element
    const idToEl = new Map<string, HTMLElement>();
    const all = document.querySelectorAll<HTMLElement>('app-card[data-node-id]');
    all.forEach(el => {
      const id = el.getAttribute('data-node-id');
      if (id) idToEl.set(id, el);
    });

    // Walk tree and connect parent -> each child
    const walk = (node: PersonNode) => {
      const parentEl = idToEl.get(node.id);
      if (node.children?.length && parentEl) {
        for (const c of node.children) {
          const childEl = idToEl.get(c.id);
          if (childEl) {
            this.lines.push(new LeaderLine(parentEl, childEl, {
              color: '#000',
              size: 2,
              path: 'straight',
              startPlug: 'behind',
              endPlug: 'behind',
              startSocket: 'bottom',
              endSocket: 'top',
            }));
          }
          walk(c);
        }
      } else if (node.children?.length) {
        // still walk even if missing parentEl
        for (const c of node.children) walk(c);
      }
    };

    walk(this.treeData);

    requestAnimationFrame(() => this.lines.forEach(l => l.position()));
  }

  private removeLines() {
    this.lines.forEach(l => l.remove());
    this.lines = [];
  }

  ngOnDestroy() {
    this.removeLines();
  }
}
