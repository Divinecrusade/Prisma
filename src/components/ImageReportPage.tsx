import React, { useRef, useEffect, useState, useCallback } from 'react';

interface AnnotationData {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  text: string;
  timestamp: string;
}

interface ReportData {
  uniqueId: string;
  imageHref: string;
  textContent: string;
  annotations: AnnotationData[];
  submittedAt: string;
}

interface ImageReportPageHeatmapProps {
  uniqueId: string;
}

const ImageReportPageHeatmap: React.FC<ImageReportPageHeatmapProps> = ({ uniqueId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasHeight, setCanvasHeight] = useState(400);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isHeatmapMode, setIsHeatmapMode] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [densityData, setDensityData] = useState<number[][]>([]);
  const [hoveredAnnotation, setHoveredAnnotation] = useState<string | null>(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Fixed vertex shader - no resolution transformation needed
  const vertexShaderSource = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      v_texCoord = a_texCoord;
    }
  `;

  // Fixed fragment shader with proper uniform handling
  const fragmentShaderSource = `
    precision mediump float;
    varying vec2 v_texCoord;
    uniform sampler2D u_image;
    uniform bool u_showHeatmap;
    uniform sampler2D u_densityTexture;
    
    void main() {
      vec4 imageColor = texture2D(u_image, v_texCoord);
      
      if (u_showHeatmap) {
        // Sample the density texture for actual annotation data
        float density = texture2D(u_densityTexture, v_texCoord).r;
        
        // Create heatmap gradient: blue -> green -> yellow -> red
        vec3 heatColor;
        if (density < 0.25) {
          heatColor = mix(vec3(0.0, 0.0, 1.0), vec3(0.0, 1.0, 1.0), density * 4.0);
        } else if (density < 0.5) {
          heatColor = mix(vec3(0.0, 1.0, 1.0), vec3(0.0, 1.0, 0.0), (density - 0.25) * 4.0);
        } else if (density < 0.75) {
          heatColor = mix(vec3(0.0, 1.0, 0.0), vec3(1.0, 1.0, 0.0), (density - 0.5) * 4.0);
        } else {
          heatColor = mix(vec3(1.0, 1.0, 0.0), vec3(1.0, 0.0, 0.0), (density - 0.75) * 4.0);
        }
        
        // Blend heatmap with original image
        gl_FragColor = vec4(mix(imageColor.rgb, heatColor, density * 0.6), 1.0);
      } else {
        gl_FragColor = imageColor;
      }
    }
  `;

  useEffect(() => {
    const mockData: ReportData = {
      uniqueId: uniqueId,
      imageHref: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&h=400&fit=crop",
      textContent: "Advanced architectural review with comprehensive annotation density analysis for structural compliance assessment.",
      annotations: [
        {
          id: "ann-1",
          left: 50,
          top: 30,
          width: 120,
          height: 80,
          text: "Foundation specifications require structural engineering review for compliance with updated building codes",
          timestamp: "2025-01-15T10:30:00Z"
        },
        {
          id: "ann-2", 
          left: 80,
          top: 50,
          width: 100,
          height: 60,
          text: "Load-bearing capacity calculations indicate potential concerns with proposed material specifications",
          timestamp: "2025-01-15T10:32:00Z"
        },
        {
          id: "ann-3",
          left: 150,
          top: 40,
          width: 90,
          height: 70,
          text: "Building envelope integration requires additional review for thermal performance standards",
          timestamp: "2025-01-15T10:35:00Z"
        },
        {
          id: "ann-4",
          left: 200,
          top: 120,
          width: 110,
          height: 85,
          text: "HVAC system placement conflicts with electrical distribution requirements in this section",
          timestamp: "2025-01-15T10:38:00Z"
        },
        {
          id: "ann-5",
          left: 180,
          top: 140,
          width: 95,
          height: 75,
          text: "Emergency egress pathway dimensions require verification against current accessibility standards",
          timestamp: "2025-01-15T10:40:00Z"
        },
        {
          id: "ann-6",
          left: 70,
          top: 60,
          width: 130,
          height: 90,
          text: "Structural beam specifications require professional engineer certification for project approval",
          timestamp: "2025-01-15T10:42:00Z"
        },
        {
          id: "ann-7",
          left: 320,
          top: 200,
          width: 140,
          height: 70,
          text: "Fire suppression system layout requires coordination with ceiling height restrictions",
          timestamp: "2025-01-15T10:44:00Z"
        },
        {
          id: "ann-8",
          left: 450,
          top: 50,
          width: 100,
          height: 100,
          text: "Seismic bracing requirements need verification against current regional standards",
          timestamp: "2025-01-15T10:46:00Z"
        }
      ],
      submittedAt: "2025-01-15T10:45:00Z"
    };

    setTimeout(() => {
      setReportData(mockData);
    }, 300);
  }, [uniqueId]);

  const createShader = (gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  };

  const createProgram = (gl: WebGLRenderingContext): WebGLProgram | null => {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    if (!vertexShader || !fragmentShader) return null;
    
    const program = gl.createProgram();
    if (!program) return null;
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    
    return program;
  };

  const loadImageTexture = (gl: WebGLRenderingContext, imageUrl: string): Promise<WebGLTexture> => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      
      const createFallbackTexture = () => {
        console.log('Creating fallback texture');
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Create a test pattern
          ctx.fillStyle = '#f0f8ff';
          ctx.fillRect(0, 0, 600, 400);
          
          // Add some visual elements
          ctx.fillStyle = '#4a90e2';
          ctx.fillRect(50, 50, 150, 100);
          ctx.fillStyle = '#7ed321';
          ctx.fillRect(250, 150, 120, 80);
          ctx.fillStyle = '#f5a623';
          ctx.fillRect(400, 100, 100, 120);
          
          // Add text
          ctx.fillStyle = '#333';
          ctx.font = '20px Arial';
          ctx.fillText('Sample Architectural Plan', 150, 300);
          ctx.font = '14px Arial';
          ctx.fillText('Foundation Section', 60, 120);
          ctx.fillText('HVAC Zone', 270, 200);
          ctx.fillText('Electrical', 420, 160);
        }
        
        const texture = gl.createTexture();
        if (!texture) {
          reject(new Error('Failed to create fallback texture'));
          return;
        }
        
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        
        resolve(texture);
      };
      
      image.onload = () => {
        console.log('Image loaded successfully');
        const texture = gl.createTexture();
        if (!texture) {
          reject(new Error('Failed to create texture'));
          return;
        }
        
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        
        resolve(texture);
      };
      
      image.onerror = () => {
        console.warn('Failed to load external image, using fallback');
        createFallbackTexture();
      };
      
      image.crossOrigin = 'anonymous';
      image.src = imageUrl;
      
      setTimeout(() => {
        if (!image.complete) {
          console.warn('Image loading timeout, using fallback');
          createFallbackTexture();
        }
      }, 3000);
    });
  };

  const createDensityTexture = (gl: WebGLRenderingContext, annotations: AnnotationData[], width: number, height: number): WebGLTexture | null => {
    const gridSize = 10;
    const textureWidth = Math.ceil(width / gridSize);
    const textureHeight = Math.ceil(height / gridSize);
    
    // Create density data array
    const densityData = new Uint8Array(textureWidth * textureHeight * 4);
    
    // Calculate density for each grid cell
    for (let y = 0; y < textureHeight; y++) {
      for (let x = 0; x < textureWidth; x++) {
        const pixelX = x * gridSize;
        const pixelY = y * gridSize;
        let density = 0;
        
        // Check each annotation for overlap with this grid cell
        for (const annotation of annotations) {
          if (pixelX < annotation.left + annotation.width &&
              pixelX + gridSize > annotation.left &&
              pixelY < annotation.top + annotation.height &&
              pixelY + gridSize > annotation.top) {
            density++;
          }
        }
        
        // Normalize density (0-255)
        const normalizedDensity = Math.min(255, density * 75);
        const index = (y * textureWidth + x) * 4;
        
        densityData[index] = normalizedDensity;     // R
        densityData[index + 1] = normalizedDensity; // G
        densityData[index + 2] = normalizedDensity; // B
        densityData[index + 3] = 255;               // A
      }
    }
    
    const texture = gl.createTexture();
    if (!texture) return null;
    
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, textureWidth, textureHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, densityData);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    
    return texture;
  };

  const calculateAnnotationDensity = (annotations: AnnotationData[], canvasWidth: number, canvasHeight: number): number[][] => {
    const gridSize = 20;
    const gridWidth = Math.ceil(canvasWidth / gridSize);
    const gridHeight = Math.ceil(canvasHeight / gridSize);
    const density = Array(gridHeight).fill(null).map(() => Array(gridWidth).fill(0));
    
    annotations.forEach(annotation => {
      const startX = Math.floor(annotation.left / gridSize);
      const endX = Math.ceil((annotation.left + annotation.width) / gridSize);
      const startY = Math.floor(annotation.top / gridSize);
      const endY = Math.ceil((annotation.top + annotation.height) / gridSize);
      
      for (let y = Math.max(0, startY); y < Math.min(gridHeight, endY); y++) {
        for (let x = Math.max(0, startX); x < Math.min(gridWidth, endX); x++) {
          density[y][x] += 1;
        }
      }
    });
    
    return density;
  };

  const renderVisualization = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !reportData) return;

    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    try {
      const program = createProgram(gl);
      if (!program) {
        console.error('Failed to create shader program');
        return;
      }
      
      gl.useProgram(program);

      // Load the image texture
      const imageTexture = await loadImageTexture(gl, reportData.imageHref);
      console.log('Image texture loaded');

      // Create density texture for heatmap
      const densityTexture = createDensityTexture(gl, reportData.annotations, canvas.width, canvas.height);
      if (!densityTexture) {
        console.error('Failed to create density texture');
        return;
      }

      // Fixed vertex data - positions and texture coordinates separated
      const positions = new Float32Array([
        -1.0, -1.0,  // Bottom left
         1.0, -1.0,  // Bottom right
        -1.0,  1.0,  // Top left
         1.0,  1.0   // Top right
      ]);
      
      const texCoords = new Float32Array([
        0.0, 1.0,  // Bottom left
        1.0, 1.0,  // Bottom right
        0.0, 0.0,  // Top left
        1.0, 0.0   // Top right
      ]);

      // Create and bind position buffer
      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
      
      const positionLocation = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      // Create and bind texture coordinate buffer
      const texCoordBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
      
      const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
      gl.enableVertexAttribArray(texCoordLocation);
      gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

      // Set up textures
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, imageTexture);
      const imageLocation = gl.getUniformLocation(program, 'u_image');
      gl.uniform1i(imageLocation, 0);
      
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, densityTexture);
      const densityLocation = gl.getUniformLocation(program, 'u_densityTexture');
      gl.uniform1i(densityLocation, 1);

      // Set heatmap mode
      const showHeatmapLocation = gl.getUniformLocation(program, 'u_showHeatmap');
      gl.uniform1i(showHeatmapLocation, isHeatmapMode ? 1 : 0);

      // Calculate density grid for statistics
      const density = calculateAnnotationDensity(reportData.annotations, canvas.width, canvas.height);
      setDensityData(density);

      // Clear and render
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      
      // Draw the quad
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      
      console.log('Rendering completed');
      setCanvasHeight(canvasRef.current?.clientHeight || 400);
    } catch (error) {
      console.error('Rendering error:', error);
    }
  };

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!overlayRef.current || !reportData) return;
    
    const rect = overlayRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 600;
    const y = ((event.clientY - rect.top) / rect.height) * 400;
    
    setMousePosition({ x, y });
    
    // Check if mouse is over any annotation
    let foundAnnotation: string | null = null;
    for (const annotation of reportData.annotations) {
      if (x >= annotation.left && 
          x <= annotation.left + annotation.width &&
          y >= annotation.top && 
          y <= annotation.top + annotation.height) {
        foundAnnotation = annotation.id;
        break;
      }
    }
    
    setHoveredAnnotation(foundAnnotation);
  }, [reportData]);

  const handleClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!overlayRef.current || !reportData) return;
    
    const rect = overlayRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 600;
    const y = ((event.clientY - rect.top) / rect.height) * 400;
    
    // Check if click is on any annotation
    for (const annotation of reportData.annotations) {
      if (x >= annotation.left && 
          x <= annotation.left + annotation.width &&
          y >= annotation.top && 
          y <= annotation.top + annotation.height) {
        setSelectedAnnotation(annotation.id === selectedAnnotation ? null : annotation.id);
        return;
      }
    }
    
    // Click outside annotations clears selection
    setSelectedAnnotation(null);
  }, [reportData, selectedAnnotation]);

  useEffect(() => {
    if (reportData) {
      renderVisualization();
    }
  }, [reportData, isHeatmapMode]);

  if (!reportData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-sm rounded-lg p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getDensityStatistics = () => {
    if (densityData.length === 0) return { max: 0, average: 0, coverage: 0 };
    
    const flatDensity = densityData.flat();
    const max = Math.max(...flatDensity);
    const total = flatDensity.reduce((sum, val) => sum + val, 0);
    const nonZero = flatDensity.filter(val => val > 0).length;
    const coverage = (nonZero / flatDensity.length) * 100;
    
    return {
      max,
      average: total / flatDensity.length,
      coverage
    };
  };

  const stats = getDensityStatistics();
  
  const getAnnotationColor = (annotationId: string, index: number) => {
    if (selectedAnnotation === annotationId) {
      return 'rgba(59, 130, 246, 0.8)'; // Blue for selected
    }
    if (hoveredAnnotation === annotationId) {
      return 'rgba(34, 197, 94, 0.8)'; // Green for hovered
    }
    
    // Use different colors for each annotation for better distinction
    const colors = [
      'rgba(239, 68, 68, 0.5)',   // Red
      'rgba(245, 158, 11, 0.5)',  // Amber
      'rgba(236, 72, 153, 0.5)',  // Pink
      'rgba(139, 92, 246, 0.5)',  // Violet
      'rgba(14, 165, 233, 0.5)',  // Sky
      'rgba(34, 197, 94, 0.5)',   // Green
      'rgba(168, 85, 247, 0.5)',  // Purple
      'rgba(251, 146, 60, 0.5)'   // Orange
    ];
    
    return colors[index % colors.length];
  };

  const hoveredAnnotationData = hoveredAnnotation 
    ? reportData.annotations.find(a => a.id === hoveredAnnotation)
    : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Advanced Annotation Analysis - {reportData.uniqueId}
                </h1>
                <p className="mt-2 text-gray-600">{reportData.textContent}</p>
                <div className="mt-4 flex space-x-6 text-sm text-gray-500">
                  <span>Submitted: {new Date(reportData.submittedAt).toLocaleString()}</span>
                  <span>Total Annotations: {reportData.annotations.length}</span>
                  <span>Coverage: {stats.coverage.toFixed(1)}%</span>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsHeatmapMode(false)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      !isHeatmapMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Standard View
                  </button>
                  <button
                    onClick={() => setIsHeatmapMode(true)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isHeatmapMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Density Analysis
                  </button>
                </div>
                {isHeatmapMode && (
                  <button
                    onClick={() => setShowAnnotations(!showAnnotations)}
                    className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                  >
                    {showAnnotations ? 'Hide' : 'Show'} Annotations
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              <div className="xl:col-span-3">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  {isHeatmapMode ? 'Annotation Density Visualization' : 'Annotated Content'}
                </h2>
                <div className="relative border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={400}
                    className="w-full h-auto block"
                  />
                  
                  {/* Annotation overlay */}
                  {(isHeatmapMode && showAnnotations) && (
                    <div 
                      ref={overlayRef}
                      className="absolute inset-0 cursor-pointer"
                      onMouseMove={handleMouseMove}
                      onClick={handleClick}
                      onMouseLeave={() => setHoveredAnnotation(null)}
                    >
                      {reportData.annotations.map((annotation, index) => (
                        <div
                          key={annotation.id}
                          className="absolute border-2 transition-all duration-200"
                          style={{
                            left: `${(annotation.left / 600) * 100}%`,
                            top: `${(annotation.top / 400) * 100}%`,
                            width: `${(annotation.width / 600) * 100}%`,
                            height: `${(annotation.height / 400) * 100}%`,
                            backgroundColor: getAnnotationColor(annotation.id, index),
                            borderColor: selectedAnnotation === annotation.id 
                              ? 'rgb(59, 130, 246)' 
                              : hoveredAnnotation === annotation.id 
                                ? 'rgb(34, 197, 94)'
                                : 'transparent',
                            borderStyle: selectedAnnotation === annotation.id || hoveredAnnotation === annotation.id
                              ? 'solid'
                              : 'dashed',
                            borderWidth: selectedAnnotation === annotation.id ? '3px' : '2px',
                            zIndex: selectedAnnotation === annotation.id ? 20 : hoveredAnnotation === annotation.id ? 10 : 1
                          }}
                        >
                          <div className="absolute -top-6 left-0 bg-gray-900 text-white text-xs px-2 py-1 rounded">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Tooltip for hovered annotation */}
                  {hoveredAnnotationData && isHeatmapMode && showAnnotations && (
                    <div 
                      className="absolute z-30 bg-gray-900 text-white p-3 rounded-lg shadow-xl max-w-xs pointer-events-none"
                      style={{
                        left: Math.min(mousePosition.x + 10, 350),
                        top: Math.min(mousePosition.y + 10, 300)
                      }}
                    >
                      <div className="text-xs font-semibold mb-1">
                        Annotation #{reportData.annotations.findIndex(a => a.id === hoveredAnnotationData.id) + 1}
                      </div>
                      <div className="text-xs">{hoveredAnnotationData.text}</div>
                      <div className="text-xs mt-2 text-gray-300">
                        Click to {selectedAnnotation === hoveredAnnotationData.id ? 'deselect' : 'select'}
                      </div>
                    </div>
                  )}
                </div>
                
                {isHeatmapMode && (
                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-3">Analysis Insights</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-blue-800">Maximum Density:</span>
                        <div className="text-blue-700">{stats.max} overlapping annotations</div>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Average Density:</span>
                        <div className="text-blue-700">{stats.average.toFixed(2)} annotations per region</div>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Coverage Area:</span>
                        <div className="text-blue-700">{stats.coverage.toFixed(1)}% of total area</div>
                      </div>
                    </div>
                    {showAnnotations && (
                      <div className="mt-4 pt-4 border-t border-blue-200">
                        <p className="text-xs text-blue-800">
                          Hover over colored rectangles to view annotation details. Click to select and highlight in the sidebar.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="xl:col-span-1">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Annotation Summary
                </h2>
                <div className="space-y-4 overflow-y-auto" style={{ height: `${canvasHeight}px` }}>
                  {reportData.annotations.map((annotation, index) => (
                    <div
                      key={annotation.id}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedAnnotation === annotation.id
                          ? 'border-blue-500 bg-blue-50'
                          : hoveredAnnotation === annotation.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedAnnotation(annotation.id === selectedAnnotation ? null : annotation.id)}
                      onMouseEnter={() => setHoveredAnnotation(annotation.id)}
                      onMouseLeave={() => setHoveredAnnotation(null)}
                    >
                      <div className="flex items-start space-x-3">
                        <div 
                          className="shrink-0 w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center"
                          style={{ backgroundColor: getAnnotationColor(annotation.id, index).replace('0.5)', '1)').replace('0.8)', '1)') }}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 mb-2">
                            {annotation.text}
                          </p>
                          <div className="text-xs text-gray-500 space-y-1">
                            <div>Position: ({annotation.left}, {annotation.top})</div>
                            <div>Dimensions: {annotation.width} × {annotation.height}</div>
                            <div>Created: {new Date(annotation.timestamp).toLocaleTimeString()}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Quality Metrics</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Total Annotations:</span>
                      <span className="font-medium">{reportData.annotations.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Review Coverage:</span>
                      <span className="font-medium">{stats.coverage.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Annotation Density:</span>
                      <span className="font-medium">{stats.average.toFixed(2)}</span>
                    </div>
                    {selectedAnnotation && (
                      <div className="pt-2 mt-2 border-t border-gray-200">
                        <span className="text-xs text-blue-600">
                          Selected: Annotation #{reportData.annotations.findIndex(a => a.id === selectedAnnotation) + 1}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Analysis Report: {reportData.uniqueId}</span>
              <span>Generated: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageReportPageHeatmap;