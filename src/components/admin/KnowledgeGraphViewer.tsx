import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Network,
  Search,
  Maximize2,
  Minimize2,
  RefreshCw,
  ExternalLink,
  Layers,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  GraduationCap,
  Users,
  Eye,
  Zap,
  Filter,
  ChevronRight,
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Focus,
  Plus,
  Minus
} from 'lucide-react';
import ApiServices, { getStoredTokens } from '../../services/ApiServices';

interface GraphNode {
  id: string;
  label: string;
  group: 'board' | 'class' | 'subject' | 'chapter' | 'topic' | 'misconception' | 'student';
  type: string;
  color: string;
  size?: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  meta?: Record<string, any>;
}

interface GraphEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  color?: string;
  type?: string;
  meta?: Record<string, any>;
}

interface StudentOption {
  id: string;
  name: string;
  email?: string;
  grade?: string;
  board?: string;
}

export const KnowledgeGraphViewer: React.FC = () => {
  const [mode, setMode] = useState<'curriculum' | 'student'>('curriculum');
  const [board, setBoard] = useState<string>('ALL');
  const [classGrade, setClassGrade] = useState<string>('ALL');
  const [subject, setSubject] = useState<string>('ALL');
  const [studentId, setStudentId] = useState<string>('');
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dynamic filter lists from Database
  const [availableBoards, setAvailableBoards] = useState<string[]>([]);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [curriculumTree, setCurriculumTree] = useState<Record<string, Record<string, string[]>>>({});

  // Cascading Dynamic Filter Options based on database mapping
  const displayBoards = useMemo(() => {
    const dbBoards = Object.keys(curriculumTree);
    return dbBoards.length > 0 ? dbBoards : availableBoards;
  }, [curriculumTree, availableBoards]);

  const displayClasses = useMemo(() => {
    if (board !== 'ALL' && curriculumTree[board]) {
      return Object.keys(curriculumTree[board]);
    }
    return availableClasses;
  }, [board, curriculumTree, availableClasses]);

  const displaySubjects = useMemo(() => {
    if (board !== 'ALL' && classGrade !== 'ALL' && curriculumTree[board]?.[classGrade]) {
      return curriculumTree[board][classGrade];
    }
    if (board !== 'ALL' && curriculumTree[board]) {
      const subs = new Set<string>();
      Object.values(curriculumTree[board]).forEach((arr: string[]) => {
        if (Array.isArray(arr)) {
          arr.forEach((s) => subs.add(s));
        }
      });
      return Array.from(subs).sort();
    }
    return availableSubjects;
  }, [board, classGrade, curriculumTree, availableSubjects]);

  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Inspector & Selection State
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [isPhysicsRunning, setIsPhysicsRunning] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Canvas & Simulation References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const simNodesRef = useRef<GraphNode[]>([]);
  const simEdgesRef = useRef<GraphEdge[]>([]);
  const animFrameIdRef = useRef<number | null>(null);

  // View Transformation (Pan & Zoom)
  const [transform, setTransform] = useState<{ x: number; y: number; k: number }>({ x: 0, y: 0, k: 0.65 });
  const transformRef = useRef({ x: 0, y: 0, k: 0.65 });
  const isDraggingCanvasRef = useRef(false);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const draggedNodeRef = useRef<GraphNode | null>(null);

  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  // 1. Fetch Knowledge Graph Data
  const loadGraphData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res: any = await ApiServices.getKnowledgeGraph({
        board,
        classGrade,
        subject,
        studentId: mode === 'student' ? studentId : undefined,
        mode,
      });

      if (res?.filterOptions) {
        if (res.filterOptions.curriculumTree) {
          setCurriculumTree(res.filterOptions.curriculumTree);
        }
        if (res.filterOptions.boards && res.filterOptions.boards.length > 0) {
          setAvailableBoards(res.filterOptions.boards);
        }
        if (res.filterOptions.classes && res.filterOptions.classes.length > 0) {
          setAvailableClasses(res.filterOptions.classes);
        }
        if (res.filterOptions.subjects && res.filterOptions.subjects.length > 0) {
          setAvailableSubjects(res.filterOptions.subjects);
        }
      }

      if (res?.nodes && res?.edges) {
        setNodes(res.nodes);
        setEdges(res.edges);
        setSummary(res.summary || {});
        if (res.students && res.students.length > 0) {
          setStudents(res.students);
          if (!studentId && mode === 'student') {
            setStudentId(res.students[0].id);
          }
        }
        initNodePositions(res.nodes, res.edges);
      } else {
        setNodes([]);
        setEdges([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch knowledge graph:', err);
      setError(err?.message || 'Could not load knowledge graph');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGraphData();
  }, [mode, board, classGrade, subject, studentId]);

  // 2. Initialize node positions in a well-spaced, tiered orbital cosmos layout
  const initNodePositions = (rawNodes: GraphNode[], rawEdges: GraphEdge[]) => {
    const width = containerRef.current?.clientWidth || 1000;
    const height = containerRef.current?.clientHeight || 600;
    const centerX = width / 2;
    const centerY = height / 2;

    const grouped: Record<string, GraphNode[]> = {
      student: [],
      board: [],
      class: [],
      subject: [],
      chapter: [],
      topic: [],
      misconception: [],
    };

    rawNodes.forEach((n) => {
      const g = n.group || 'topic';
      if (!grouped[g]) grouped[g] = [];
      grouped[g].push(n);
    });

    const positionedNodes: GraphNode[] = [];

    // Place Student / Boards at Center Core
    if (grouped.student.length > 0) {
      grouped.student.forEach((n) => {
        positionedNodes.push({ ...n, x: centerX, y: centerY, vx: 0, vy: 0, size: 30 });
      });
    }

    // Place Boards in center or small ring
    const boardCount = grouped.board.length;
    const boardRadius = boardCount <= 1 ? 0 : 90;
    grouped.board.forEach((n, idx) => {
      const angle = (idx / Math.max(1, boardCount)) * 2 * Math.PI;
      positionedNodes.push({
        ...n,
        x: centerX + (boardRadius ? boardRadius * Math.cos(angle) : 0),
        y: centerY + (boardRadius ? boardRadius * Math.sin(angle) : 0),
        vx: 0,
        vy: 0,
        size: 28,
      });
    });

    // Place Classes on Orbit 1
    const classCount = grouped.class.length;
    const classRadius = Math.max(180, Math.min(300, 140 + classCount * 12));
    grouped.class.forEach((n, idx) => {
      const angle = (idx / Math.max(1, classCount)) * 2 * Math.PI + 0.2;
      positionedNodes.push({
        ...n,
        x: centerX + classRadius * Math.cos(angle),
        y: centerY + classRadius * Math.sin(angle),
        vx: 0,
        vy: 0,
        size: 22,
      });
    });

    // Place Subjects on Orbit 2
    const subjectCount = grouped.subject.length;
    const subjectRadius = Math.max(340, Math.min(520, classRadius + 160 + subjectCount * 3));
    grouped.subject.forEach((n, idx) => {
      const angle = (idx / Math.max(1, subjectCount)) * 2 * Math.PI + 0.4;
      positionedNodes.push({
        ...n,
        x: centerX + subjectRadius * Math.cos(angle),
        y: centerY + subjectRadius * Math.sin(angle),
        vx: 0,
        vy: 0,
        size: 18,
      });
    });

    // Place Chapters on Multi-tiered Orbits to avoid crowding
    const chapterCount = grouped.chapter.length;
    const chapBaseRadius = subjectRadius + 180;
    grouped.chapter.forEach((n, idx) => {
      // Stagger across 3 sub-orbits to spread out dense clusters
      const tier = idx % 3;
      const r = chapBaseRadius + tier * 85;
      const angle = (idx / Math.max(1, chapterCount)) * 2 * Math.PI + (idx % 2 === 0 ? 0.05 : -0.05);
      positionedNodes.push({
        ...n,
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
        vx: 0,
        vy: 0,
        size: 13,
      });
    });

    // Place Topics on Outer Orbits
    const topicCount = grouped.topic.length;
    const topicBaseRadius = chapBaseRadius + 280;
    grouped.topic.forEach((n, idx) => {
      const tier = idx % 4;
      const r = topicBaseRadius + tier * 70;
      const angle = (idx / Math.max(1, topicCount)) * 2 * Math.PI + (idx % 3 * 0.03);
      positionedNodes.push({
        ...n,
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
        vx: 0,
        vy: 0,
        size: 10,
      });
    });

    // Place Misconceptions radiating outwards
    const miscCount = grouped.misconception.length;
    const miscRadius = topicBaseRadius + 280;
    grouped.misconception.forEach((n, idx) => {
      const angle = (idx / Math.max(1, miscCount)) * 2 * Math.PI;
      positionedNodes.push({
        ...n,
        x: centerX + miscRadius * Math.cos(angle),
        y: centerY + miscRadius * Math.sin(angle),
        vx: 0,
        vy: 0,
        size: 14,
      });
    });

    simNodesRef.current = positionedNodes;
    simEdgesRef.current = rawEdges;

    // Auto-fit initial zoom scale based on graph density
    const totalN = rawNodes.length;
    let initialZoom = 0.75;
    if (totalN > 1000) initialZoom = 0.32;
    else if (totalN > 300) initialZoom = 0.45;
    else if (totalN > 50) initialZoom = 0.62;

    const initialX = (width / 2) - (centerX * initialZoom);
    const initialY = (height / 2) - (centerY * initialZoom);
    setTransform({ x: initialX, y: initialY, k: initialZoom });
  };

  // 3. Simple & Smooth 2D Simulation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const stepSimulation = () => {
      if (!running) return;

      const currentNodes = simNodesRef.current;
      const currentEdges = simEdgesRef.current;
      const nodeMap = new Map<string, GraphNode>();
      currentNodes.forEach((n) => nodeMap.set(n.id, n));

      if (isPhysicsRunning && currentNodes.length < 500) {
        // Light spring force along edges
        currentEdges.forEach((edge) => {
          const fromNode = nodeMap.get(edge.from);
          const toNode = nodeMap.get(edge.to);
          if (!fromNode || !toNode) return;

          const dx = (toNode.x || 0) - (fromNode.x || 0);
          const dy = (toNode.y || 0) - (fromNode.y || 0);
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const targetDist = 120;
          const force = (dist - targetDist) * 0.003;

          if (fromNode !== draggedNodeRef.current) {
            fromNode.vx = (fromNode.vx || 0) + (dx / dist) * force;
            fromNode.vy = (fromNode.vy || 0) + (dy / dist) * force;
          }
          if (toNode !== draggedNodeRef.current) {
            toNode.vx = (toNode.vx || 0) - (dx / dist) * force;
            toNode.vy = (toNode.vy || 0) - (dy / dist) * force;
          }
        });

        // Apply velocity with damping
        currentNodes.forEach((node) => {
          if (node === draggedNodeRef.current) return;
          node.x = (node.x || 0) + (node.vx || 0);
          node.y = (node.y || 0) + (node.vy || 0);
          node.vx = (node.vx || 0) * 0.85;
          node.vy = (node.vy || 0) * 0.85;
        });
      }

      // Render on Canvas with Z-Ordering and LOD
      renderCanvas(ctx, canvas, currentNodes, currentEdges, nodeMap);
      animFrameIdRef.current = requestAnimationFrame(stepSimulation);
    };

    animFrameIdRef.current = requestAnimationFrame(stepSimulation);

    return () => {
      running = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isPhysicsRunning, selectedNode, hoveredNode, searchQuery, transform]);

  // Helper for Z-index draw ordering
  const getNodeZIndex = (g: string): number => {
    switch (g) {
      case 'student': return 10;
      case 'board': return 9;
      case 'class': return 8;
      case 'subject': return 7;
      case 'misconception': return 6;
      case 'chapter': return 4;
      case 'topic': return 2;
      default: return 1;
    }
  };

  // 4. Canvas Drawing Function with Layering & Level-Of-Detail
  const renderCanvas = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    currentNodes: GraphNode[],
    currentEdges: GraphEdge[],
    nodeMap: Map<string, GraphNode>
  ) => {
    const { x: panX, y: panY, k: zoom } = transformRef.current;
    const width = canvas.width;
    const height = canvas.height;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // Dark sleek canvas background
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, width, height);

    // Apply Pan and Zoom
    ctx.translate(panX, panY);
    ctx.scale(zoom, zoom);

    // 4.1 Draw Edges with distinct colors and high visibility
    currentEdges.forEach((edge) => {
      const fromNode = nodeMap.get(edge.from);
      const toNode = nodeMap.get(edge.to);
      if (!fromNode || !toNode || fromNode.x === undefined || toNode.x === undefined) return;

      const isHighlight =
        (selectedNode && (edge.from === selectedNode.id || edge.to === selectedNode.id)) ||
        (hoveredNode && (edge.from === hoveredNode.id || edge.to === hoveredNode.id));
      const isWeakMisconception = edge.type?.includes('MISCONCEPTION') || toNode.group === 'misconception';
      const isMastery = edge.type?.includes('MASTERY');
      const isBoardToClass = fromNode.group === 'board' || toNode.group === 'class';
      const isClassToSubject = fromNode.group === 'class' || toNode.group === 'subject';
      const isSubjectToChapter = fromNode.group === 'subject' || toNode.group === 'chapter';

      ctx.beginPath();
      ctx.moveTo(fromNode.x, fromNode.y!);
      ctx.lineTo(toNode.x, toNode.y!);

      if (isHighlight) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3.5;
        ctx.setLineDash([]);
      } else if (isWeakMisconception) {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.9)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([5, 3]);
      } else if (isMastery) {
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.9)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([]);
      } else if (isBoardToClass) {
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
        ctx.lineWidth = 2.2;
        ctx.setLineDash([]);
      } else if (isClassToSubject) {
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.65)';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([]);
      } else if (isSubjectToChapter) {
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.55)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([]);
      } else {
        // Chapter to Topic or other connections
        ctx.strokeStyle = 'rgba(20, 184, 166, 0.5)';
        ctx.lineWidth = 1.3;
        ctx.setLineDash([]);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Edge Label only when zoomed in or highlighted
      if ((zoom > 0.75 || isHighlight) && edge.label) {
        const midX = (fromNode.x + toNode.x) / 2;
        const midY = (fromNode.y! + toNode.y!) / 2;
        const labelText = edge.label;
        ctx.font = 'bold 9px Outfit, sans-serif';
        const tWidth = ctx.measureText(labelText).width;

        // Draw small subtle background behind edge label for readability
        ctx.fillStyle = isHighlight ? 'rgba(245, 158, 11, 0.95)' : 'rgba(15, 23, 42, 0.85)';
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(midX - tWidth / 2 - 3, midY - 6, tWidth + 6, 12, 3);
        } else {
          ctx.rect(midX - tWidth / 2 - 3, midY - 6, tWidth + 6, 12);
        }
        ctx.fill();

        ctx.fillStyle = isHighlight ? '#0f172a' : '#cbd5e1';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelText, midX, midY);
      }
    });

    // 4.2 Sort Nodes by Z-Order: Higher groups (Board, Class, Student) rendered ON TOP of chapters/topics!
    const sortedNodes = [...currentNodes].sort((a, b) => {
      const isASelected = selectedNode?.id === a.id || hoveredNode?.id === a.id;
      const isBSelected = selectedNode?.id === b.id || hoveredNode?.id === b.id;
      if (isASelected) return 1;
      if (isBSelected) return -1;
      return getNodeZIndex(a.group) - getNodeZIndex(b.group);
    });

    // 4.3 Draw Nodes & Dynamic Level-Of-Detail (LOD) Labels
    sortedNodes.forEach((node) => {
      if (node.x === undefined || node.y === undefined) return;

      const isSelected = selectedNode?.id === node.id;
      const isHovered = hoveredNode?.id === node.id;
      const isSearchMatch =
        searchQuery && node.label.toLowerCase().includes(searchQuery.toLowerCase().trim());
      const radius = (node.size || 12) * (isSelected || isHovered ? 1.35 : 1);

      // Node Glow Halo
      if (isSelected || isSearchMatch || node.group === 'board' || node.group === 'student') {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + (isSelected ? 9 : 5), 0, 2 * Math.PI);
        if (isSelected) {
          ctx.fillStyle = 'rgba(245, 158, 11, 0.45)';
        } else if (isSearchMatch) {
          ctx.fillStyle = 'rgba(234, 179, 8, 0.45)';
        } else if (node.group === 'student') {
          ctx.fillStyle = 'rgba(236, 72, 153, 0.35)';
        } else {
          ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
        }
        ctx.fill();
      }

      // Main Node Circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = node.color || '#3b82f6';
      ctx.fill();
      ctx.lineWidth = isSelected ? 3.5 : (node.group === 'board' || node.group === 'student' ? 2.5 : 1.2);
      ctx.strokeStyle = isSelected ? '#ffffff' : (node.group === 'board' ? '#fde68a' : 'rgba(255, 255, 255, 0.7)');
      ctx.stroke();

      // Determine if label should be rendered based on Level-of-Detail (LOD)
      let showLabel = false;
      if (isSelected || isHovered || isSearchMatch) {
        showLabel = true;
      } else if (node.group === 'board' || node.group === 'student') {
        showLabel = true; // Always show Board / Student labels on top!
      } else if (node.group === 'class' && zoom >= 0.35) {
        showLabel = true;
      } else if (node.group === 'subject' && zoom >= 0.6) {
        showLabel = true;
      } else if (node.group === 'misconception' && zoom >= 0.8) {
        showLabel = true;
      } else if (node.group === 'chapter' && zoom >= 1.25) {
        showLabel = true;
      } else if (node.group === 'topic' && zoom >= 1.75) {
        showLabel = true;
      }

      if (showLabel) {
        const labelText = node.label.length > 28 ? node.label.substring(0, 26) + '...' : node.label;
        const isProminent = node.group === 'board' || node.group === 'student' || isSelected || isSearchMatch;
        const fontSize = isProminent ? 11 : 9;
        ctx.font = `${isProminent ? 'bold' : 'normal'} ${fontSize}px Outfit, sans-serif`;
        
        const textMetrics = ctx.measureText(labelText);
        const textWidth = textMetrics.width;
        const textHeight = fontSize + 4;
        const boxX = node.x - textWidth / 2 - 4;
        const boxY = node.y + radius + 4;

        // Draw pill background behind text for maximum contrast & crispness
        ctx.fillStyle = isSelected ? 'rgba(245, 158, 11, 0.95)' : 'rgba(15, 23, 42, 0.88)';
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(boxX, boxY, textWidth + 8, textHeight, 4);
        } else {
          ctx.rect(boxX, boxY, textWidth + 8, textHeight);
        }
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#ffffff' : (isProminent ? 'rgba(245, 158, 11, 0.6)' : 'rgba(71, 85, 105, 0.5)');
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Draw Text inside pill
        ctx.fillStyle = isSelected ? '#0f172a' : '#f8fafc';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelText, node.x, boxY + textHeight / 2);
      }
    });

    ctx.restore();
  };

  // 5. Mouse Interaction Event Handlers (Drag, Pan, Zoom, Click)
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const { x: panX, y: panY, k: zoom } = transformRef.current;
    const worldX = (mouseX - panX) / zoom;
    const worldY = (mouseY - panY) / zoom;

    // Check if clicking on a node
    const clickedNode = simNodesRef.current.find((n) => {
      if (n.x === undefined || n.y === undefined) return false;
      const dx = n.x - worldX;
      const dy = n.y - worldY;
      return Math.sqrt(dx * dx + dy * dy) <= (n.size || 12) + 8;
    });

    if (clickedNode) {
      draggedNodeRef.current = clickedNode;
      setSelectedNode(clickedNode);
    } else {
      isDraggingCanvasRef.current = true;
      dragStartPosRef.current = { x: e.clientX - panX, y: e.clientY - panY };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const { x: panX, y: panY, k: zoom } = transformRef.current;

    if (draggedNodeRef.current) {
      draggedNodeRef.current.x = (mouseX - panX) / zoom;
      draggedNodeRef.current.y = (mouseY - panY) / zoom;
    } else if (isDraggingCanvasRef.current) {
      setTransform({
        x: e.clientX - dragStartPosRef.current.x,
        y: e.clientY - dragStartPosRef.current.y,
        k: zoom,
      });
    } else {
      // Hover detection
      const worldX = (mouseX - panX) / zoom;
      const worldY = (mouseY - panY) / zoom;
      const hovered = simNodesRef.current.find((n) => {
        if (n.x === undefined || n.y === undefined) return false;
        const dx = n.x - worldX;
        const dy = n.y - worldY;
        return Math.sqrt(dx * dx + dy * dy) <= (n.size || 12) + 8;
      });
      setHoveredNode(hovered || null);
    }
  };

  const handleMouseUp = () => {
    draggedNodeRef.current = null;
    isDraggingCanvasRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    const newZoom = Math.min(4.5, Math.max(0.12, transform.k * zoomFactor));

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newX = mouseX - (mouseX - transform.x) * (newZoom / transform.k);
    const newY = mouseY - (mouseY - transform.y) * (newZoom / transform.k);

    setTransform({ x: newX, y: newY, k: newZoom });
  };

  // Zoom In / Zoom Out / Reset View Helpers
  const handleZoomIn = () => {
    const canvas = canvasRef.current;
    const width = canvas?.clientWidth || 1000;
    const height = canvas?.clientHeight || 600;
    const centerX = width / 2;
    const centerY = height / 2;
    const newZoom = Math.min(4.5, transform.k * 1.3);
    const newX = centerX - (centerX - transform.x) * (newZoom / transform.k);
    const newY = centerY - (centerY - transform.y) * (newZoom / transform.k);
    setTransform({ x: newX, y: newY, k: newZoom });
  };

  const handleZoomOut = () => {
    const canvas = canvasRef.current;
    const width = canvas?.clientWidth || 1000;
    const height = canvas?.clientHeight || 600;
    const centerX = width / 2;
    const centerY = height / 2;
    const newZoom = Math.max(0.12, transform.k * 0.75);
    const newX = centerX - (centerX - transform.x) * (newZoom / transform.k);
    const newY = centerY - (centerY - transform.y) * (newZoom / transform.k);
    setTransform({ x: newX, y: newY, k: newZoom });
  };

  const handleFitView = () => {
    if (simNodesRef.current.length === 0) return;
    const canvas = canvasRef.current;
    const width = canvas?.clientWidth || 1000;
    const height = canvas?.clientHeight || 600;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    simNodesRef.current.forEach((n) => {
      if (n.x !== undefined && n.y !== undefined) {
        if (n.x < minX) minX = n.x;
        if (n.x > maxX) maxX = n.x;
        if (n.y < minY) minY = n.y;
        if (n.y > maxY) maxY = n.y;
      }
    });

    if (minX === Infinity) {
      setTransform({ x: 0, y: 0, k: 0.65 });
      return;
    }

    const graphWidth = Math.max(200, maxX - minX + 160);
    const graphHeight = Math.max(200, maxY - minY + 160);
    const scaleX = (width * 0.88) / graphWidth;
    const scaleY = (height * 0.88) / graphHeight;
    const fitZoom = Math.min(1.2, Math.max(0.15, Math.min(scaleX, scaleY)));
    const graphCenterX = (minX + maxX) / 2;
    const graphCenterY = (minY + maxY) / 2;
    const fitX = (width / 2) - (graphCenterX * fitZoom);
    const fitY = (height / 2) - (graphCenterY * fitZoom);

    setTransform({ x: fitX, y: fitY, k: fitZoom });
    setSelectedNode(null);
  };

  const handleResetZoom = () => {
    const width = containerRef.current?.clientWidth || 1000;
    const height = containerRef.current?.clientHeight || 600;
    setTransform({ x: width * 0.05, y: height * 0.05, k: 0.7 });
    setSelectedNode(null);
  };

  const handleOpenStandaloneHtml = async () => {
    try {
      const htmlText = await ApiServices.exportKnowledgeGraphHtml({
        board,
        classGrade,
        subject,
        studentId: mode === 'student' ? studentId : undefined,
        mode,
      });

      if (htmlText) {
        const blob = new Blob([htmlText], { type: 'text/html;charset=utf-8' });
        const blobUrl = URL.createObjectURL(blob);
        const newWin = window.open(blobUrl, '_blank');
        if (!newWin) {
          window.location.href = blobUrl;
        }
      }
    } catch (err) {
      console.error('Error opening standalone viewer:', err);
      const exportUrl = ApiServices.getKnowledgeGraphExportUrl({
        board,
        classGrade,
        subject,
        studentId: mode === 'student' ? studentId : undefined,
        mode,
      });
      window.open(exportUrl, '_blank');
    }
  };

  const handleSyncKnowledgeGraph = async () => {
    try {
      setIsSyncing(true);
      setSyncMessage(null);
      const res: any = await ApiServices.syncKnowledgeGraph();
      if (res?.success) {
        setSyncMessage(`Curriculum sync successful! Preserved all existing data. Synced ${res.synced_chapters || 0} chapters & ${res.synced_topics || 0} topics.`);
        setTimeout(() => setSyncMessage(null), 7000);
        await loadGraphData();
      } else {
        setSyncMessage(res?.message || 'Sync encountered an issue');
      }
    } catch (err: any) {
      console.error('Failed to sync knowledge graph:', err);
      setSyncMessage(err?.message || 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  // Connected edges for selected node
  const selectedNodeEdges = useMemo(() => {
    if (!selectedNode) return [];
    return edges.filter((e) => e.from === selectedNode.id || e.to === selectedNode.id);
  }, [selectedNode, edges]);

  return (
    <div
      ref={containerRef}
      className={`space-y-4 relative ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-900 p-6 overflow-hidden' : ''}`}
    >
      {/* Sync Status Banner */}
      {syncMessage && (
        <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncMessage}</span>
          </div>
          <button
            onClick={() => setSyncMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-4 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. TOP CONTROL BAR & FILTERS                                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-5 shadow-xs space-y-4">
        {/* Row 1: Mode Switcher & Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Mode Tabs */}
          <div className="inline-flex p-1 rounded-2xl bg-stone-100 border border-stone-200/80">
            <button
              onClick={() => setMode('curriculum')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'curriculum'
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>Global Curriculum Topology</span>
            </button>
            <button
              onClick={() => setMode('student')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'student'
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-pink-600" />
              <span>Student Mastery & Diagnostics</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSyncKnowledgeGraph}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-sky-900 bg-sky-50 hover:bg-sky-100 border border-sky-200/80 rounded-xl transition-all shadow-2xs cursor-pointer disabled:opacity-60"
              title="Reconcile MySQL Curriculum into ArangoDB Graph safely without deleting any data"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-sky-600 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync MySQL to Graph'}</span>
            </button>

            <button
              onClick={handleOpenStandaloneHtml}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-xl transition-all shadow-2xs cursor-pointer"
              title="Open full-screen interactive standalone HTML"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
              <span>Open Standalone HTML Viewer</span>
            </button>

            <button
              onClick={() => setIsPhysicsRunning(!isPhysicsRunning)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl transition-all cursor-pointer"
            >
              <Zap className={`w-3.5 h-3.5 ${isPhysicsRunning ? 'text-amber-500' : 'text-stone-400'}`} />
              <span>{isPhysicsRunning ? 'Freeze Physics' : 'Resume Physics'}</span>
            </button>

            <button
              onClick={handleResetZoom}
              className="p-2 text-stone-600 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl transition-all cursor-pointer"
              title="Reset Zoom"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            <button
              onClick={loadGraphData}
              disabled={loading}
              className="p-2 text-stone-600 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl transition-all cursor-pointer"
              title="Refresh Graph"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Row 2: Filter Selectors & Search Input */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2 border-t border-stone-100">
          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            {mode === 'curriculum' ? (
              <>
                {/* Board Selector */}
                <select
                  value={board}
                  onChange={(e) => {
                    const newBoard = e.target.value;
                    setBoard(newBoard);
                    if (newBoard !== 'ALL' && curriculumTree[newBoard]) {
                      const allowedClasses = Object.keys(curriculumTree[newBoard]);
                      if (classGrade !== 'ALL' && !allowedClasses.includes(classGrade)) {
                        setClassGrade('ALL');
                        setSubject('ALL');
                      }
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-stone-700 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Boards</option>
                  {displayBoards.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>

                {/* Class Grade */}
                <select
                  value={classGrade}
                  onChange={(e) => {
                    const newClass = e.target.value;
                    setClassGrade(newClass);
                    if (board !== 'ALL' && newClass !== 'ALL' && curriculumTree[board]?.[newClass]) {
                      const allowedSubjects = curriculumTree[board][newClass];
                      if (subject !== 'ALL' && !allowedSubjects.includes(subject)) {
                        setSubject('ALL');
                      }
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-stone-700 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Classes</option>
                  {displayClasses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                {/* Subject */}
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="px-3 py-1.5 text-xs font-bold text-stone-700 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none cursor-pointer max-w-[200px] truncate"
                >
                  <option value="ALL">All Subjects</option>
                  {displaySubjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <>
                {/* Student Selector in Student Diagnostics Mode */}
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="px-3 py-1.5 text-xs font-bold text-pink-900 bg-pink-50 border border-pink-200 rounded-xl focus:outline-none cursor-pointer"
                >
                  <option value="">Select Student...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      👤 {s.name} ({s.grade || 'Class 10'} • {s.board || 'CBSE'})
                    </option>
                  ))}
                </select>

                {/* Student Target Badge */}
                {summary?.studentMetrics && (
                  <span className="px-2.5 py-1 text-[11px] font-bold bg-pink-100 text-pink-700 border border-pink-200 rounded-xl">
                    {summary.studentMetrics.studentBoard || 'CBSE'} • {summary.studentMetrics.studentGrade || 'Class 10'}
                  </span>
                )}

                {/* Subject Filter for Student */}
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="px-3 py-1.5 text-xs font-bold text-stone-700 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none cursor-pointer max-w-[200px] truncate"
                >
                  <option value="ALL">All Subjects</option>
                  {displaySubjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>

          {/* Search Node */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search topic, chapter, concept..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-900"
            />
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. SUMMARY METRICS BAR                                        */}
      {/* ───────────────────────────────────────────────────────────── */}
      {mode === 'curriculum' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-3 bg-white rounded-2xl border border-stone-200/80 shadow-xs">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Total Nodes</p>
            <h4 className="text-base font-black text-stone-900 mt-0.5">{summary.totalNodes || nodes.length}</h4>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-stone-200/80 shadow-xs">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Relationships</p>
            <h4 className="text-base font-black text-stone-900 mt-0.5">{summary.totalEdges || edges.length}</h4>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-stone-200/80 shadow-xs">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Chapters</p>
            <h4 className="text-base font-black text-emerald-600 mt-0.5">{summary.chaptersCount || 0}</h4>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-stone-200/80 shadow-xs">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Concepts & Topics</p>
            <h4 className="text-base font-black text-cyan-600 mt-0.5">{summary.topicsCount || 0}</h4>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-stone-200/80 shadow-xs">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">ArangoDB Engine</p>
            <h4 className="text-xs font-bold text-emerald-700 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {summary.arangoDbActive ? 'Live ArangoDB' : 'Hybrid SQL Graph'}
            </h4>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-3 bg-white rounded-2xl border border-stone-200/80 shadow-xs">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Assessed Topics</p>
            <h4 className="text-base font-black text-stone-900 mt-0.5">
              {summary.studentMetrics?.assessedTopicsCount || summary.topicsCount || 0}
            </h4>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-emerald-200/80 bg-emerald-50/20 shadow-xs">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Mastered Concepts</p>
            <h4 className="text-base font-black text-emerald-600 mt-0.5">
              {summary.studentMetrics?.masteredCount || 0}
            </h4>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-rose-200/80 bg-rose-50/20 shadow-xs">
            <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Diagnosed Gaps</p>
            <h4 className="text-base font-black text-rose-600 mt-0.5">
              {summary.studentMetrics?.weakGapsCount || summary.misconceptionsCount || 0}
            </h4>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-sky-200/80 bg-sky-50/20 shadow-xs">
            <p className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">Avg Mastery</p>
            <h4 className="text-base font-black text-sky-600 mt-0.5">
              {summary.studentMetrics?.avgMastery || 0}%
            </h4>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-pink-200/80 bg-pink-50/20 shadow-xs">
            <p className="text-[10px] font-bold text-pink-600 uppercase tracking-wider">Student Profile</p>
            <h4 className="text-xs font-bold text-pink-700 mt-1 flex items-center gap-1 truncate">
              <span>{summary.studentMetrics?.avatar || '👤'}</span>
              <span className="truncate">{summary.studentMetrics?.studentName || 'Student'}</span>
            </h4>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. INTERACTIVE 2D KNOWLEDGE GRAPH CANVAS                      */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="relative w-full h-[580px] bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-xs text-amber-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p className="text-xs font-bold text-slate-200">Synthesizing Topology Nodes & Edges...</p>
          </div>
        ) : nodes.length === 0 ? (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <Network className="w-10 h-10 text-slate-600" />
            <p className="text-sm font-bold text-slate-300">No Knowledge Nodes Found</p>
            <p className="text-xs text-slate-500">Ingest curriculum textbooks or question papers to build topology.</p>
          </div>
        ) : null}

        <canvas
          ref={canvasRef}
          width={1200}
          height={600}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        />

        {/* Floating Top Right Interactive Zoom & View Toolbar */}
        <div className="absolute top-4 right-4 bg-slate-800/90 backdrop-blur-md border border-slate-700/80 p-1.5 rounded-2xl z-20 flex items-center gap-1 shadow-2xl">
          <button
            onClick={handleZoomIn}
            className="p-2 text-slate-200 hover:text-white hover:bg-slate-700/80 rounded-xl transition-all cursor-pointer"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          
          <span className="px-2 py-1 text-[11px] font-mono font-bold text-amber-400 bg-slate-900/60 rounded-lg min-w-[46px] text-center select-none">
            {Math.round(transform.k * 100)}%
          </span>

          <button
            onClick={handleZoomOut}
            className="p-2 text-slate-200 hover:text-white hover:bg-slate-700/80 rounded-xl transition-all cursor-pointer"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-slate-700 mx-0.5" />

          <button
            onClick={handleFitView}
            className="p-2 text-slate-200 hover:text-amber-300 hover:bg-slate-700/80 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
            title="Fit Entire Graph to Screen"
          >
            <Focus className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Fit</span>
          </button>

          <button
            onClick={handleResetZoom}
            className="p-2 text-slate-200 hover:text-white hover:bg-slate-700/80 rounded-xl transition-all cursor-pointer"
            title="Reset to Default Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPhysicsRunning(!isPhysicsRunning)}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isPhysicsRunning
                ? 'text-amber-400 bg-amber-500/20 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/80'
            }`}
            title={isPhysicsRunning ? 'Freeze Physics' : 'Resume Physics'}
          >
            <Zap className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-slate-200 hover:text-white hover:bg-slate-700/80 rounded-xl transition-all cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Floating Bottom Left Legend */}
        <div className="absolute bottom-4 left-4 bg-slate-800/85 backdrop-blur-md border border-slate-700/80 p-3.5 rounded-2xl z-20 text-[11px] space-y-1.5 shadow-2xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Concept Legend</p>
          {mode === 'curriculum' ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-300 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Board</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span>Class</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                <span>Subject</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Chapter</span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                <span>Topic</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-300 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                <span>Student</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                <span>Subject</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Mastered (≥75%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                <span>Topic</span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                <span className="text-rose-300">Diagnosed Gap (Misconception)</span>
              </div>
            </div>
          )}
        </div>

        {/* Slide-in Node Inspector Drawer (Right Side) */}
        {selectedNode && (
          <div className="absolute top-4 bottom-4 right-4 w-80 bg-slate-800/95 backdrop-blur-xl border border-slate-700/90 rounded-2xl p-4 shadow-2xl z-20 flex flex-col justify-between animate-fadeIn">
            <div className="space-y-3 overflow-y-auto pr-1">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  {selectedNode.group}
                </span>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Node Name</p>
                <h3 className="text-base font-black text-white mt-0.5 leading-snug">{selectedNode.label}</h3>
              </div>

              {selectedNode.meta && (
                <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800 text-[11px] space-y-1.5 font-mono text-slate-300">
                  {Object.entries(selectedNode.meta).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2">
                      <span className="text-slate-500">{k}:</span>
                      <span className="text-slate-200 font-semibold truncate max-w-[150px]">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Connected Relationships */}
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">
                  Connected Concepts ({selectedNodeEdges.length})
                </p>
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {selectedNodeEdges.map((e) => (
                    <div
                      key={e.id}
                      className="p-2 bg-slate-900/50 rounded-lg border border-slate-800 text-[11px] flex items-center justify-between text-slate-300"
                    >
                      <span className="font-semibold">{e.label || 'LINKED_TO'}</span>
                      <span className="text-amber-400 font-mono text-[10px]">
                        {e.from === selectedNode.id ? `→ ${e.to.split('_', 2)[1] || e.to}` : `← ${e.from.split('_', 2)[1] || e.from}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedNode(null)}
              className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer mt-2"
            >
              Close Inspector
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
