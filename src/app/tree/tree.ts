import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChildren,
  QueryList,
  viewChild,
  ViewChild,
} from '@angular/core';
import { treeData, PersonNode } from '../treeData';
import { TreeNode } from './tree-node/tree-node';

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

  @ViewChild('viewport', { static: true }) viewport!: ElementRef<HTMLDivElement>;

  // Only useful if you actually add #cardHost in the template.
  @ViewChildren('cardHost', { read: ElementRef })
  cardHosts!: QueryList<ElementRef<HTMLElement>>;

  private lines: any[] = [];
  private rebuildQueued = false;

  ngAfterViewInit() {
    this.buildLines();

    // If you DO add #cardHost to each app-card, this will catch DOM changes.
    // If not, you can remove cardHosts entirely and keep queueRebuild() calls only.
    this.cardHosts?.changes?.subscribe(() => this.queueRebuild());
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

    // Map node id -> element (requires: <app-card [attr.data-node-id]="node.id" ...>)
    const idToEl = new Map<string, HTMLElement>();
    const all = document.querySelectorAll<HTMLElement>('app-card[data-node-id]');
    all.forEach(el => {
      const id = el.getAttribute('data-node-id');
      if (id) idToEl.set(id, el);
    });

    const drawnPartnerKeys = new Set<string>();
    const partnerKey = (aId: string, bId: string) => [aId, bId].sort().join('|');

    const pointAnchorMid = (aEl: HTMLElement, bEl: HTMLElement) => {
      const a = aEl.getBoundingClientRect();
      const b = bEl.getBoundingClientRect();
      const ax = a.left + a.width / 2;
      const ay = a.top + a.height / 2;
      const bx = b.left + b.width / 2;
      const by = b.top + b.height / 2;
      return LeaderLine.pointAnchor({ x: (ax + bx) / 2, y: (ay + by) / 2 });
    };

    const drawPartnerLine = (a: PersonNode) => {
      if (!a.partner) return;

      const aEl = idToEl.get(a.id);
      const pEl = idToEl.get(a.partner.id);
      if (!aEl || !pEl) return;

      // avoid duplicate partner lines
      const key = partnerKey(a.id, a.partner.id);
      if (drawnPartnerKeys.has(key)) return;
      drawnPartnerKeys.add(key);

      // choose sockets based on horizontal order
      const aRect = aEl.getBoundingClientRect();
      const pRect = pEl.getBoundingClientRect();
      const aIsLeft = aRect.left < pRect.left;

      this.lines.push(
        new LeaderLine(aEl, pEl, {
          color: '#000',
          size: 2,
          path: 'straight',
          startPlug: 'behind',
          endPlug: 'behind',
          startSocket: aIsLeft ? 'right' : 'left',
          endSocket: aIsLeft ? 'left' : 'right',
        })
      );
    };

    const walk = (node: PersonNode) => {
      drawPartnerLine(node);

      const parentEl = idToEl.get(node.id);
      if (!parentEl) {
        node.children?.forEach(walk);
        return;
      }

      // If partner exists, child lines should start from the midpoint between them
      const partnerEl = node.partner ? idToEl.get(node.partner.id) : undefined;
      const startAnchor = partnerEl ? pointAnchorMid(parentEl, partnerEl) : parentEl;

      if (node.children?.length) {
        for (const c of node.children) {
          const childEl = idToEl.get(c.id);
          if (childEl) {
            this.lines.push(
              new LeaderLine(startAnchor, childEl, {
                color: '#000',
                size: 2,
                path: 'grid',
                startPlug: 'behind',
                endPlug: 'behind',
                startSocket: 'bottom',
                endSocket: 'top',
                startSocketGravity: 80
              })
            );
          }
          walk(c);
        }
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

  private dragging = false;
  private startX = 0;
  private startY = 0;
  private startScrollLeft = 0;
  private startScrollTop = 0;

  onDown(e: PointerEvent) {
    const el = this.viewport.nativeElement;
    this.dragging = true;

    el.classList.add('dragging');
    el.setPointerCapture(e.pointerId);

    this.startX = e.clientX;
    this.startY = e.clientY;
    this.startScrollLeft = el.scrollLeft;
    this.startScrollTop = el.scrollTop;
  }

  onMove(e: PointerEvent) {
    if (!this.dragging) return;

    const el = this.viewport.nativeElement;
    const dx = e.clientX - this.startX;
    const dy = e.clientY - this.startY;

    // invert so dragging right moves content right (i.e., scroll left decreases)
    el.scrollLeft = this.startScrollLeft - dx;
    el.scrollTop = this.startScrollTop - dy;
  }

  onUp(e: PointerEvent) {
    if (!this.dragging) return;

    const el = this.viewport.nativeElement;
    this.dragging = false;

    el.classList.remove('dragging');
    try { el.releasePointerCapture(e.pointerId); } catch {}
  }
}
