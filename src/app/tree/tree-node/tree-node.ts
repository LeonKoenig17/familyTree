import { Component, Input } from '@angular/core';
import { Card } from '../card/card';
import { PersonNode } from '../../treeData';

@Component({
  selector: 'app-tree-node',
  imports: [Card],
  templateUrl: './tree-node.html',
  styleUrl: './tree-node.scss',
})
export class TreeNode {
  @Input() node!: PersonNode;
}
