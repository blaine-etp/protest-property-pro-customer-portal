import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Database,
  Table,
  Key,
  Link,
  Eye,
  Users,
  Building,
  FileText,
  CreditCard,
  Gavel,
  UserCheck,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";

interface DatabaseSchemaViewerProps {
  onEntitySelect: (entityId: string) => void;
}

export function DatabaseSchemaViewer({ onEntitySelect }: DatabaseSchemaViewerProps) {
  const [hoveredEntity, setHoveredEntity] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  const entities = [
    {
      id: "contacts",
      name: "Contacts",
      icon: Users,
      color: "blue",
      fields: ["id", "first_name", "last_name", "email", "phone", "created_at"],
      relationships: ["owners", "communications"],
      x: 100,
      y: 100,
    },
    {
      id: "owners",
      name: "Owners",
      icon: UserCheck,
      color: "green",
      fields: ["id", "contact_id", "property_id", "ownership_type", "percentage"],
      relationships: ["contacts", "properties"],
      x: 400,
      y: 100,
    },
    {
      id: "properties",
      name: "Properties",
      icon: Building,
      color: "purple",
      fields: ["id", "address", "parcel_number", "assessed_value", "market_value"],
      relationships: ["owners", "bills", "protests"],
      x: 700,
      y: 100,
    },
    {
      id: "bills",
      name: "Bills",
      icon: CreditCard,
      color: "orange",
      fields: ["id", "property_id", "tax_year", "assessed_value", "due_date"],
      relationships: ["properties", "protests"],
      x: 700,
      y: 350,
    },
    {
      id: "protests",
      name: "Protests",
      icon: Gavel,
      color: "red",
      fields: ["id", "property_id", "bill_id", "status", "filed_date", "hearing_date"],
      relationships: ["properties", "bills", "documents"],
      x: 400,
      y: 350,
    },
    {
      id: "documents",
      name: "Documents",
      icon: FileText,
      color: "gray",
      fields: ["id", "protest_id", "document_type", "file_path", "generated_at"],
      relationships: ["protests"],
      x: 400,
      y: 500,
    },
    {
      id: "communications",
      name: "Communications",
      icon: Mail,
      color: "pink",
      fields: ["id", "contact_id", "type", "subject", "content", "sent_at"],
      relationships: ["contacts"],
      x: 100,
      y: 350,
    },
  ];

  const connections = [
    { from: "contacts", to: "owners", label: "1:M" },
    { from: "owners", to: "properties", label: "M:M" },
    { from: "properties", to: "bills", label: "1:M" },
    { from: "bills", to: "protests", label: "1:1" },
    { from: "protests", to: "documents", label: "1:M" },
    { from: "contacts", to: "communications", label: "1:M" },
  ];

  const handleEntityClick = (entityId: string) => {
    setSelectedEntity(entityId);
    onEntitySelect(entityId);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Schema Visualization
          </CardTitle>
          <CardDescription>
            Interactive view of the CRM database structure and relationships
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative bg-slate-50 rounded-lg p-6 min-h-[800px] overflow-auto">
            {/* Entity Boxes */}
            {entities.map((entity) => {
              const EntityIcon = entity.icon;
              const isHovered = hoveredEntity === entity.id;
              const isSelected = selectedEntity === entity.id;
              
              return (
                <div
                  key={entity.id}
                  className={`absolute bg-white border-2 rounded-lg p-4 shadow-sm cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'border-blue-500 shadow-lg scale-105' 
                      : isHovered 
                        ? 'border-gray-400 shadow-md scale-102' 
                        : 'border-gray-200 hover:shadow-md'
                  }`}
                  style={{ left: entity.x, top: entity.y, width: '200px' }}
                  onMouseEnter={() => setHoveredEntity(entity.id)}
                  onMouseLeave={() => setHoveredEntity(null)}
                  onClick={() => handleEntityClick(entity.id)}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`p-1 rounded bg-${entity.color}-100`}>
                      <EntityIcon className={`h-4 w-4 text-${entity.color}-600`} />
                    </div>
                    <h3 className="font-semibold text-sm">{entity.name}</h3>
                  </div>
                  
                  <div className="space-y-1">
                    {entity.fields.slice(0, 4).map((field) => (
                      <div key={field} className="flex items-center gap-2 text-xs">
                        {field === 'id' ? (
                          <Key className="h-3 w-3 text-yellow-500" />
                        ) : field.endsWith('_id') ? (
                          <Link className="h-3 w-3 text-blue-500" />
                        ) : (
                          <div className="w-3 h-3 rounded-full bg-gray-300" />
                        )}
                        <span className="text-gray-600">{field}</span>
                      </div>
                    ))}
                    {entity.fields.length > 4 && (
                      <div className="text-xs text-gray-400">
                        +{entity.fields.length - 4} more fields
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <div className="flex flex-wrap gap-1">
                      {entity.relationships.slice(0, 2).map((rel) => (
                        <Badge key={rel} variant="outline" className="text-xs">
                          {rel}
                        </Badge>
                      ))}
                      {entity.relationships.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{entity.relationships.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Connection Lines */}
            <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
              {connections.map((connection, index) => {
                const fromEntity = entities.find(e => e.id === connection.from);
                const toEntity = entities.find(e => e.id === connection.to);
                
                if (!fromEntity || !toEntity) return null;
                
                const x1 = fromEntity.x + 100;
                const y1 = fromEntity.y + 60;
                const x2 = toEntity.x + 100;
                const y2 = toEntity.y + 60;
                
                const midX = (x1 + x2) / 2;
                const midY = (y1 + y2) / 2;
                
                return (
                  <g key={index}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#94a3b8"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                    <circle
                      cx={midX}
                      cy={midY}
                      r="12"
                      fill="white"
                      stroke="#94a3b8"
                      strokeWidth="1"
                    />
                    <text
                      x={midX}
                      y={midY + 3}
                      textAnchor="middle"
                      className="text-xs font-medium fill-gray-600"
                    >
                      {connection.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </CardContent>
      </Card>

      {/* Entity Details Panel */}
      {selectedEntity && (
        <Card>
          <CardHeader>
            <CardTitle>Entity Details: {entities.find(e => e.id === selectedEntity)?.name}</CardTitle>
            <CardDescription>
              Detailed view of the selected database entity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const entity = entities.find(e => e.id === selectedEntity);
              if (!entity) return null;

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Fields</h4>
                    <div className="space-y-2">
                      {entity.fields.map((field) => (
                        <div key={field} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                          {field === 'id' ? (
                            <Key className="h-4 w-4 text-yellow-500" />
                          ) : field.endsWith('_id') ? (
                            <Link className="h-4 w-4 text-blue-500" />
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-gray-300" />
                          )}
                          <span className="font-mono text-sm">{field}</span>
                          <Badge variant="outline" className="ml-auto text-xs">
                            {field === 'id' ? 'PK' : field.endsWith('_id') ? 'FK' : 'Field'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Relationships</h4>
                    <div className="space-y-2">
                      {entity.relationships.map((rel) => (
                        <div key={rel} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                          <Link className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">{rel}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="ml-auto"
                            onClick={() => {
                              const relatedEntity = entities.find(e => e.id === rel);
                              if (relatedEntity) {
                                setSelectedEntity(rel);
                                onEntitySelect(rel);
                              }
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}