import { Component, Input } from '@angular/core';
import { ChildNode } from '../../treeData';

@Component({
  selector: 'app-card',
  imports: [],
  templateUrl: './card.html',
  styleUrl: './card.scss',
})
export class Card {
  @Input() person: ChildNode = {name: ""};
}
