import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Card } from './card/card';
import { treeData } from '../treeData';

declare const LeaderLine: any;

@Component({
  selector: 'app-tree',
  // standalone: true,
  imports: [Card],
  templateUrl: './tree.html',
  styleUrls: ['./tree.scss'],
})
export class Tree implements AfterViewInit, OnDestroy {
  treeData = treeData;

  @Input() node!: ChildNode;

  @ViewChild('parentCard', { read: ElementRef })
  parentRef!: ElementRef<HTMLElement>;

  // optional (because @if)
  @ViewChild('partnerCard', { read: ElementRef })
  partnerRef?: ElementRef<HTMLElement>;
  
  @ViewChildren('childCard', { read: ElementRef })
  childRefs!: QueryList<ElementRef<HTMLElement>>;
  
  private lines: any[] = [];
  private rebuildQueued = false;

  ngAfterViewInit() {
    this.buildLines();

    // If your children list changes later, rebuild once
    this.childRefs.changes.subscribe(() => this.queueRebuildLines());
  }

  @HostListener('window:resize')
  onResize() {
    this.queueRebuildLines();
  }

  @HostListener('window:scroll')
  onScroll() {
    this.queueRebuildLines();
  }

  private queueRebuildLines() {
    if (this.rebuildQueued) return;
    this.rebuildQueued = true;
    
    requestAnimationFrame(() => {
      this.rebuildQueued = false;
      this.buildLines();
    });
  }

  private buildLines() {
    this.removeLines();

    const parentEl = this.parentRef?.nativeElement;
    if (!parentEl) return;

    const partnerEl = this.partnerRef?.nativeElement;

    // 1) parent ↔ partner line
    if (partnerEl) {
      this.lines.push(
        new LeaderLine(parentEl, partnerEl, {
          color: '#000',
          size: 2,
          path: 'straight',
          startPlug: 'behind',
          endPlug: 'behind',
        })
      );
    }

    // 2) midpoint anchor for child lines (fallback to parent if no partner)
    const start = partnerEl ? this.getMidpointAnchor(parentEl, partnerEl) : parentEl;

    // 3) midpoint → each child
    for (const childRef of this.childRefs.toArray()) {
      this.lines.push(
        new LeaderLine(start, childRef.nativeElement, {
          color: '#000',
          size: 2,
          path: 'straight',
          startPlug: 'behind',
          endPlug: 'behind',
          // optional if children are below:
          startSocket: 'bottom',
          endSocket: 'top',
        })
      );
    }

    // One position pass after creation (NOT a rebuild)
    requestAnimationFrame(() => {
      for (const line of this.lines) line.position();
    });
  }

  private getMidpointAnchor(aEl: HTMLElement, bEl: HTMLElement) {
    const a = aEl.getBoundingClientRect();
    const b = bEl.getBoundingClientRect();

    const ax = a.left + a.width / 2;
    const ay = a.top + a.height / 2;
    const bx = b.left + b.width / 2;
    const by = b.top + b.height / 2;

    return LeaderLine.pointAnchor({ x: (ax + bx) / 2, y: (ay + by) / 2 });
  }

  private removeLines() {
    for (const line of this.lines) line.remove();
    this.lines = [];
  }

  ngOnDestroy() {
    this.removeLines();
  }
}
