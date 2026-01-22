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
                startSocketGravity: 80 * this.scale
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

  scale = 1;
  minScale = 0.3;
  maxScale = 4;

  translateX = 0;
  translateY = 0;

  dragging = false;
  startX = 0;
  startY = 0;

  get transform() {
    return `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
  }

  /* ================= ZOOM ================= */
  onWheel(e: WheelEvent) {
    e.preventDefault();
    this.queueRebuild();

    const zoomSpeed = 0.0015;
    const delta = -e.deltaY * zoomSpeed;
    const newScale = this.clamp(this.scale * (1 + delta), this.minScale, this.maxScale);

    const rect = this.viewport.nativeElement.getBoundingClientRect();

    // Mouse position relative to viewport
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // World position before zoom
    const worldX = (mouseX - this.translateX) / this.scale;
    const worldY = (mouseY - this.translateY) / this.scale;

    // Apply zoom
    this.scale = newScale;

    // Adjust pan so zoom happens at cursor
    this.translateX = mouseX - worldX * this.scale;
    this.translateY = mouseY - worldY * this.scale;
  }

  /* ================= PAN ================= */
  onDown(e: PointerEvent) {
    this.dragging = true;
    this.startX = e.clientX - this.translateX;
    this.startY = e.clientY - this.translateY;

    const el = this.viewport.nativeElement;
    el.classList.add('dragging');
    el.setPointerCapture(e.pointerId);
  }

  onMove(e: PointerEvent) {
    if (!this.dragging) return;
    this.queueRebuild();
    this.translateX = e.clientX - this.startX;
    this.translateY = e.clientY - this.startY;
  }

  onUp(e: PointerEvent) {
    this.dragging = false;
    this.viewport.nativeElement.classList.remove('dragging');

    // Optional but correct when using pointer events
    try {
      this.viewport.nativeElement.releasePointerCapture(e.pointerId);
    } catch {}
  }

  /* ================= UTILS ================= */
  clamp(v: number, min: number, max: number) {
    return Math.max(min, Math.min(max, v));
  }
}
