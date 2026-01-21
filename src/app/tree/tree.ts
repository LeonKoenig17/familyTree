import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild,
  ViewChildren,
  QueryList
} from '@angular/core';
import { Card } from './card/card';
import { treeData } from '../treeData';

declare const LeaderLine: any;

@Component({
  selector: 'app-tree',
  standalone: true,
  imports: [Card],
  templateUrl: './tree.html',
  styleUrls: ['./tree.scss']
})
export class Tree implements AfterViewInit, OnDestroy {
  treeData = treeData;

  // parent (root) card element
  @ViewChild('parentCard', { read: ElementRef })
  parentRef!: ElementRef<HTMLElement>;

  // all child card elements rendered by @for
  @ViewChildren('childCard', { read: ElementRef })
  childRefs!: QueryList<ElementRef<HTMLElement>>;

  private lines: any[] = [];

  ngAfterViewInit() {
    this.buildLines();

    // if children list changes later (expand/collapse, async load), rebuild
    this.childRefs.changes.subscribe(() => this.buildLines());
  }

  private buildLines() {
    this.removeLines();

    const parentEl = this.parentRef?.nativeElement;
    if (!parentEl) return;

    for (const childRef of this.childRefs.toArray()) {
      const childEl = childRef.nativeElement;

      const line = new LeaderLine(parentEl, childEl, {
        color: '#000',
        size: 2,
        path: 'straight',
        startPlug: 'behind',
        endPlug: 'behind'
      });

      this.lines.push(line);
    }

    // position after paint
    queueMicrotask(() => this.positionLines());
  }

  private positionLines() {
    for (const line of this.lines) line.position();
  }

  private removeLines() {
    for (const line of this.lines) line.remove();
    this.lines = [];
  }

  @HostListener('window:resize')
  onResize() {
    this.positionLines();
  }

  @HostListener('window:scroll')
  onScroll() {
    this.positionLines();
  }

  ngOnDestroy() {
    this.removeLines();
  }
}
